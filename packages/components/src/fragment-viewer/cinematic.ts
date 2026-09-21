import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as THREE from "three";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {GTAOPass} from "three/examples/jsm/postprocessing/GTAOPass.js";
import {FullScreenQuad} from "three/examples/jsm/postprocessing/Pass.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";

/**
 * Cinematic mode — sun-lit shading for the building, over a pixel-identical grid and background.
 *
 * The look that reads as "3D and beautiful" is a sun that casts shadows, ambient occlusion for contact
 * darkening, and ACES filmic tone mapping. But the grid and background must stay exactly what the normal
 * viewer shows — no tone mapping, no AO, no glow — for both a white and a dark app background.
 *
 * How it stays pixel-identical (verified against the installed three r182 + SDK source):
 *  - That Open keeps rendering the normal frame to the canvas every tick (renderer stays enabled). That
 *    frame IS the untouched grid + background.
 *  - On `world.onAfterUpdate` we render ONLY the building through an effect chain into an off-screen HDR
 *    buffer (RenderPass → GTAO), build a white-on-black silhouette mask, then draw a fullscreen quad over
 *    the canvas that applies ACES + sRGB to the building and **discards every non-building pixel**. Grid
 *    and background pixels are therefore never written — byte-identical, by construction.
 *  - Global renderer colour state (`toneMapping`, `outputColorSpace`) is never touched: three forces
 *    linear/no-tone-map when rendering into a target, so the building buffer is linear HDR and the quad
 *    does the one and only ACES+sRGB encode itself.
 *
 * Two deliberate limitations of keeping the grid untouched: no ground/cast shadow (it would darken the
 * grid — the building self-shadows only), and no outward bloom halo (it would tint the grid/sky).
 *
 * Everything is built on enable and fully freed on disable, so it costs nothing (memory or frame time)
 * while off.
 */

interface CinematicOptions {
	/** ACES exposure applied to the building in the composite. */
	exposure?: number;
}

/** ACES filmic + sRGB, inlined to match three's ACESFilmicToneMapping + SRGBColorSpace exactly, plus a
 *  hard silhouette mask so only building pixels are ever written. */
const COMPOSITE_FRAGMENT = /* glsl */ `
	varying vec2 vUv;
	uniform sampler2D tBuilding; // linear HDR (off-screen render — leave colorSpace default, do not decode)
	uniform sampler2D tMask;     // white-on-black building coverage
	uniform float uExposure;

	vec3 RRTAndODTFit(vec3 v) {
		vec3 a = v * (v + 0.0245786) - 0.000090537;
		vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
		return a / b;
	}
	vec3 ACESFilmic(vec3 color) {
		const mat3 ACESInputMat = mat3(
			0.59719, 0.07600, 0.02840,
			0.35458, 0.90834, 0.13383,
			0.04823, 0.01566, 0.83777);
		const mat3 ACESOutputMat = mat3(
			 1.60475, -0.10208, -0.00327,
			-0.53108,  1.10813, -0.07276,
			-0.07367, -0.00605,  1.07602);
		color *= uExposure / 0.6;
		color = ACESInputMat * color;
		color = RRTAndODTFit(color);
		color = ACESOutputMat * color;
		return clamp(color, 0.0, 1.0);
	}
	vec3 sRGB_OETF(vec3 c) {
		return mix(pow(c, vec3(0.41666)) * 1.055 - vec3(0.055), c * 12.92, vec3(lessThanEqual(c, vec3(0.0031308))));
	}
	void main() {
		float m = texture2D(tMask, vUv).r;
		if (m < 0.5) discard; // grid + background pixels are never written
		vec3 hdr = texture2D(tBuilding, vUv).rgb;
		gl_FragColor = vec4(sRGB_OETF(ACESFilmic(hdr)), 1.0);
	}
`;

const COMPOSITE_VERTEX = /* glsl */ `
	varying vec2 vUv;
	void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

type World = OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>;

interface SavedLight {
	castShadow: boolean;
	position: THREE.Vector3;
	target: THREE.Vector3;
	intensity: number;
	color: number;
	mapSize: THREE.Vector2;
	bias: number;
	normalBias: number;
	shadowCam: {left: number; right: number; top: number; bottom: number; near: number; far: number};
}

export class Cinematic {
	private readonly world: World;
	private exposure = 1.2;

	private enabled = false;
	private hooked: (() => void) | null = null;
	private grid: THREE.Object3D | null = null;

	// Effect chain + composite (built on enable, disposed on disable).
	private composer: EffectComposer | null = null;
	private renderPass: RenderPass | null = null;
	private gtaoPass: GTAOPass | null = null;
	private maskRT: THREE.WebGLRenderTarget | null = null;
	private whiteMaterial: THREE.MeshBasicMaterial | null = null;
	private compositeMaterial: THREE.ShaderMaterial | null = null;
	private fsQuad: FullScreenQuad | null = null;

	// Lights we drive (restored on disable).
	private sunLight: THREE.DirectionalLight | null = null;
	private ambientLight: THREE.AmbientLight | null = null;

	private saved: {
		shadowEnabled: boolean;
		shadowType: THREE.ShadowMapType;
		shadowAutoUpdate: boolean;
		meshShadows: {mesh: THREE.Mesh; cast: boolean; receive: boolean}[];
		light: SavedLight | null;
		ambientIntensity: number | null;
	} | null = null;

	/** Tracks the camera projection so the GTAO material's PERSPECTIVE_CAMERA define can be refreshed
	 *  when the viewer toggles perspective↔orthographic (the SDK bakes it once at construction). */
	private lastCameraIsPerspective: boolean | null = null;

	constructor(world: World, options: CinematicOptions = {}) {
		this.world = world;
		if (options.exposure !== undefined) this.exposure = options.exposure;
	}

	get active(): boolean {
		return this.enabled;
	}

	/** Turn cinematic mode on. `modelBox` frames the sun's shadow camera; `grid` is hidden per sub-render. */
	enable(modelBox: THREE.Box3 | null, grid: THREE.Object3D | null): void {
		if (this.enabled) return;
		const renderer = this.world.renderer;
		if (!renderer) return;
		this.enabled = true;
		this.grid = grid;

		this.saveState();
		this.configureShadowsAndLights(modelBox);
		this.flagMeshes();
		this.buildComposer();

		const render = () => this.render();
		this.world.onAfterUpdate.add(render);
		this.hooked = () => this.world.onAfterUpdate.remove(render);
	}

	/** Turn it off: restore every mutation and free every GPU resource (no idle VRAM). */
	disable(): void {
		if (!this.enabled) return;
		this.enabled = false;
		this.hooked?.();
		this.hooked = null;
		this.disposeComposer();
		this.restoreState();
		this.grid = null;
	}

	resize(): void {
		if (!this.enabled || !this.composer) return;
		const {width, height, dpr} = this.canvasSize();
		this.composer.setSize(width, height);
		this.composer.setPixelRatio(dpr);
		this.maskRT?.setSize(Math.floor(width * dpr), Math.floor(height * dpr));
	}

	dispose(): void {
		this.disable();
	}

	// ─── Setup ──────────────────────────────────────────────────────────────

	private canvasSize(): {width: number; height: number; dpr: number} {
		const three = this.world.renderer?.three;
		const dpr = three?.getPixelRatio() ?? 1;
		const canvas = three?.domElement;
		if (!canvas) return {width: 2, height: 2, dpr};
		return {
			width: Math.floor(canvas.clientWidth || canvas.width / dpr),
			height: Math.floor(canvas.clientHeight || canvas.height / dpr),
			dpr,
		};
	}

	private saveState(): void {
		const three = this.world.renderer?.three;
		if (!three) return;
		const scene = this.world.scene.three;
		const meshShadows: {mesh: THREE.Mesh; cast: boolean; receive: boolean}[] = [];
		scene.traverse((object) => {
			const mesh = object as THREE.Mesh;
			if (mesh.isMesh) meshShadows.push({mesh, cast: mesh.castShadow, receive: mesh.receiveShadow});
		});
		this.saved = {
			shadowEnabled: three.shadowMap.enabled,
			shadowType: three.shadowMap.type,
			shadowAutoUpdate: three.shadowMap.autoUpdate,
			meshShadows,
			light: null,
			ambientIntensity: null,
		};
	}

	/** Enable the shadow map and re-balance the lights so the building isn't flat under ACES. Global
	 *  colour state (tone mapping / output colour space / background) is intentionally left untouched —
	 *  the grid + background must render exactly as normal, and only the building buffer is tone-mapped. */
	private configureShadowsAndLights(modelBox: THREE.Box3 | null): void {
		const three = this.world.renderer?.three;
		if (!three) return;
		three.shadowMap.enabled = true;
		three.shadowMap.type = THREE.PCFSoftShadowMap;
		// The sun and model are static during the mode, and the shadow map is view-independent, so don't
		// let three recompute the 4096² map on every renderer.render (~4×/frame). render() flags a single
		// recompute per frame instead — which also picks up geometry streamed in as you zoom.
		three.shadowMap.autoUpdate = false;

		const box =
			modelBox && !modelBox.isEmpty()
				? modelBox
				: new THREE.Box3(new THREE.Vector3(-10, 0, -10), new THREE.Vector3(10, 20, 10));
		const sphere = box.getBoundingSphere(new THREE.Sphere());
		const r = Math.max(sphere.radius, 1);

		const light = [...this.world.scene.directionalLights.values()][0];
		if (light) {
			this.sunLight = light;
			if (this.saved) {
				const c = light.shadow.camera;
				this.saved.light = {
					castShadow: light.castShadow,
					position: light.position.clone(),
					target: light.target.position.clone(),
					intensity: light.intensity,
					color: light.color.getHex(),
					mapSize: light.shadow.mapSize.clone(),
					bias: light.shadow.bias,
					normalBias: light.shadow.normalBias,
					shadowCam: {left: c.left, right: c.right, top: c.top, bottom: c.bottom, near: c.near, far: c.far},
				};
			}
			// Warm key pushed past linear 1.0 so ACES's highlight rolloff engages; low fill so shadows read.
			light.intensity = 3.0;
			light.color.set("#ffedcf");
			const dir = new THREE.Vector3(0.45, 0.85, 0.35).normalize();
			light.position.copy(sphere.center).add(dir.multiplyScalar(r * 2.5));
			light.target.position.copy(sphere.center);
			light.target.updateMatrixWorld();
			light.castShadow = true;
			light.shadow.mapSize.set(4096, 4096);
			light.shadow.bias = -0.0004;
			light.shadow.normalBias = 0.05;
			const cam = light.shadow.camera;
			cam.left = -r;
			cam.right = r;
			cam.top = r;
			cam.bottom = -r;
			cam.near = r;
			cam.far = r * 4;
			cam.updateProjectionMatrix();
		}

		const ambient = [...this.world.scene.ambientLights.values()][0];
		if (ambient) {
			this.ambientLight = ambient;
			if (this.saved) this.saved.ambientIntensity = ambient.intensity;
			ambient.intensity = 0.3;
		}
	}

	/** Flag full-detail (MeshLambert) meshes to cast + receive self-shadows; exclude the LOD shader (no
	 *  depth program) and the grid. Run per-frame because zoom streams new meshes. */
	private flagMeshes(): void {
		this.world.scene.three.traverse((object) => {
			const mesh = object as THREE.Mesh;
			if (!mesh.isMesh || mesh === this.grid) return;
			const material = mesh.material;
			const isLambert = Array.isArray(material)
				? material.some((m) => (m as {isMeshLambertMaterial?: boolean}).isMeshLambertMaterial)
				: (material as {isMeshLambertMaterial?: boolean}).isMeshLambertMaterial === true;
			if (isLambert) {
				mesh.castShadow = true;
				mesh.receiveShadow = true;
			} else {
				mesh.castShadow = false;
			}
		});
	}

	private buildComposer(): void {
		const renderer = this.world.renderer?.three;
		if (!renderer) return;
		const scene = this.world.scene.three;
		const camera = this.world.camera.three;
		const {width, height, dpr} = this.canvasSize();

		this.composer = new EffectComposer(renderer);
		this.composer.renderToScreen = false; // final building image stays in composer.readBuffer.texture
		this.composer.setSize(width, height);
		this.composer.setPixelRatio(dpr);

		this.renderPass = new RenderPass(scene, camera);
		this.composer.addPass(this.renderPass);

		this.gtaoPass = new GTAOPass(scene, camera, width, height);
		this.gtaoPass.output = GTAOPass.OUTPUT.Default;
		this.gtaoPass.blendIntensity = 1.0;
		this.gtaoPass.updateGtaoMaterial({
			radius: 1.5,
			distanceExponent: 1.0,
			thickness: 1.0,
			scale: 1.0,
			samples: 16,
			screenSpaceRadius: false,
		});
		this.composer.addPass(this.gtaoPass);
		// GTAO bakes PERSPECTIVE_CAMERA at construction from the current camera; remember it so render()
		// only refreshes the define on an actual projection change.
		this.lastCameraIsPerspective = (camera as THREE.PerspectiveCamera).isPerspectiveCamera === true;

		// Full-res silhouette mask (must pixel-align with the canvas; no half-res).
		this.maskRT = new THREE.WebGLRenderTarget(Math.floor(width * dpr), Math.floor(height * dpr), {
			depthBuffer: true,
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
		});
		this.whiteMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});

		this.compositeMaterial = new THREE.ShaderMaterial({
			uniforms: {
				tBuilding: {value: null},
				tMask: {value: null},
				uExposure: {value: this.exposure},
			},
			vertexShader: COMPOSITE_VERTEX,
			fragmentShader: COMPOSITE_FRAGMENT,
			toneMapped: false, // custom shader does its own ACES+sRGB; three must not re-encode
			depthTest: false,
			depthWrite: false,
			blending: THREE.NoBlending,
		});
		this.fsQuad = new FullScreenQuad(this.compositeMaterial);
	}

	// ─── Per-frame ──────────────────────────────────────────────────────────

	private render(): void {
		const renderer = this.world.renderer?.three;
		if (!this.enabled || !renderer) return;
		if (!this.composer || !this.maskRT || !this.whiteMaterial || !this.compositeMaterial || !this.fsQuad) return;
		const scene = this.world.scene.three;
		const camera = this.world.camera.three;

		// Re-flag streamed meshes each frame (cheap, and catches new geometry). Refresh pass cameras too
		// (OrthoPerspectiveCamera swaps its object on projection toggle).
		this.flagMeshes();
		if (this.renderPass) this.renderPass.camera = camera;
		if (this.gtaoPass) {
			this.gtaoPass.camera = camera;
			// GTAO's projection define is baked once; refresh it when perspective↔ortho actually changes,
			// or its depth→view reconstruction (and the AO) goes wrong in the swapped projection.
			const isPerspective = (camera as THREE.PerspectiveCamera).isPerspectiveCamera === true;
			if (this.lastCameraIsPerspective !== isPerspective) {
				this.gtaoPass.gtaoMaterial.defines.PERSPECTIVE_CAMERA = isPerspective ? 1 : 0;
				this.gtaoPass.gtaoMaterial.needsUpdate = true;
				this.lastCameraIsPerspective = isPerspective;
			}
		}
		// One shadow-map recompute per frame (autoUpdate is off) — picks up streamed geometry, but avoids
		// the ~4 recomputes the multiple renderer.render calls below would otherwise each trigger.
		renderer.shadowMap.needsUpdate = true;

		const prevTarget = renderer.getRenderTarget();
		const prevAutoClear = renderer.autoClear;
		const prevClearColor = renderer.getClearColor(new THREE.Color());
		const prevClearAlpha = renderer.getClearAlpha();
		const prevBackground = scene.background;
		const prevOverride = scene.overrideMaterial;
		const prevGridVisible = this.grid?.visible ?? true;

		// 1) Building layer → composer.readBuffer (linear HDR, grid hidden, transparent clear).
		if (this.grid) this.grid.visible = false;
		scene.background = null;
		renderer.setClearColor(0x000000, 0);
		this.composer.render();

		// 2) White-on-black silhouette mask (same hidden grid).
		scene.overrideMaterial = this.whiteMaterial;
		renderer.setRenderTarget(this.maskRT);
		renderer.setClearColor(0x000000, 1);
		renderer.autoClear = true;
		renderer.clear();
		renderer.render(scene, camera);

		// Restore the scene before drawing to the canvas.
		scene.overrideMaterial = prevOverride;
		scene.background = prevBackground;
		if (this.grid) this.grid.visible = prevGridVisible;

		// 3) Composite over That Open's canvas frame: ACES+sRGB the building, discard grid/bg pixels.
		this.compositeMaterial.uniforms.tBuilding.value = this.composer.readBuffer.texture;
		this.compositeMaterial.uniforms.tMask.value = this.maskRT.texture;
		renderer.setRenderTarget(null);
		renderer.autoClear = false;
		this.fsQuad.render(renderer);

		renderer.autoClear = prevAutoClear;
		renderer.setClearColor(prevClearColor, prevClearAlpha);
		renderer.setRenderTarget(prevTarget);
	}

	// ─── Teardown ───────────────────────────────────────────────────────────

	private disposeComposer(): void {
		this.composer?.dispose();
		// three's GTAOPass.dispose() leaks its gtaoMaterial + blendMaterial; free them explicitly.
		this.gtaoPass?.gtaoMaterial?.dispose();
		this.gtaoPass?.blendMaterial?.dispose();
		this.gtaoPass?.dispose();
		this.maskRT?.dispose();
		this.whiteMaterial?.dispose();
		this.compositeMaterial?.dispose();
		this.fsQuad?.dispose();
		this.composer = null;
		this.renderPass = null;
		this.gtaoPass = null;
		this.maskRT = null;
		this.whiteMaterial = null;
		this.compositeMaterial = null;
		this.fsQuad = null;
	}

	private restoreState(): void {
		const saved = this.saved;
		const three = this.world.renderer?.three;
		if (!saved || !three) return;
		three.shadowMap.enabled = saved.shadowEnabled;
		three.shadowMap.type = saved.shadowType;
		three.shadowMap.autoUpdate = saved.shadowAutoUpdate;
		// Restore the enable-time meshes; reset anything streamed in while active to the default (unflagged)
		// so no stale cast/receive flags linger after the mode is off.
		const savedMeshes = new Set(saved.meshShadows.map((m) => m.mesh));
		for (const {mesh, cast, receive} of saved.meshShadows) {
			mesh.castShadow = cast;
			mesh.receiveShadow = receive;
		}
		this.world.scene.three.traverse((object) => {
			const mesh = object as THREE.Mesh;
			if (mesh.isMesh && !savedMeshes.has(mesh)) {
				mesh.castShadow = false;
				mesh.receiveShadow = false;
			}
		});
		if (this.sunLight && saved.light) {
			const s = saved.light;
			this.sunLight.castShadow = s.castShadow;
			this.sunLight.position.copy(s.position);
			this.sunLight.target.position.copy(s.target);
			this.sunLight.target.updateMatrixWorld();
			this.sunLight.intensity = s.intensity;
			this.sunLight.color.setHex(s.color);
			this.sunLight.shadow.mapSize.copy(s.mapSize);
			this.sunLight.shadow.bias = s.bias;
			this.sunLight.shadow.normalBias = s.normalBias;
			const c = this.sunLight.shadow.camera;
			c.left = s.shadowCam.left;
			c.right = s.shadowCam.right;
			c.top = s.shadowCam.top;
			c.bottom = s.shadowCam.bottom;
			c.near = s.shadowCam.near;
			c.far = s.shadowCam.far;
			c.updateProjectionMatrix();
			this.sunLight.shadow.map?.dispose();
			this.sunLight.shadow.map = null;
		}
		if (this.ambientLight && saved.ambientIntensity !== null) {
			this.ambientLight.intensity = saved.ambientIntensity;
		}
		this.sunLight = null;
		this.ambientLight = null;
		this.saved = null;
	}
}
