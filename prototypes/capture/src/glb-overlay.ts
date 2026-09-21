import {useFragmentViewer} from "@core/core-ui/fragment-viewer";
import {useEffect} from "react";
import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Render a GLB "over" the FragmentViewer's BIM model.
 *
 * The viewer exposes its three.js world publicly (`api.viewport().world`), so this loads the GLB with
 * three's GLTFLoader and adds `gltf.scene` to `world.scene.three` — the same scene the BIM model lives
 * in, so it renders in the same camera + lighting. It's scaled up (OVERLAY_SCALE) about its own centre
 * so it reads at the right size next to the model, and point clouds get a visible point size. Removed
 * and disposed on unmount / when hidden.
 *
 * Notes:
 * - Uncompressed GLBs only — DRACO/meshopt-compressed files need extra loaders wired into GLTFLoader.
 * - For precise alignment with the BIM model, transform `gltf.scene` into the model's coordinate frame
 *   instead of framing the camera on the overlay.
 */
// The overlay reads too small at native scale, so scale it up. Bump/lower this to resize.
const OVERLAY_SCALE = 20;
// Raise the overlay along Z by this fraction of its own size. (Scene is Y-up — if this moves it
// sideways instead of up, switch `position.z` to `position.y` in the loader below.)
const OVERLAY_LIFT = 0.15;

export function useGlbOverlay(src: string | null, visible: boolean) {
	const {state, api} = useFragmentViewer();

	useEffect(() => {
		if (!src || !visible || state.status !== "ready") return;
		const world = api.viewport()?.world;
		if (!world) return;
		const scene = world.scene.three;

		let cancelled = false;
		let root: THREE.Object3D | null = null;

		new GLTFLoader().load(
			src,
			(gltf) => {
				if (cancelled) return;
				root = gltf.scene;

				// Scale it up (see OVERLAY_SCALE) about its own centre so it stays put — georeferenced
				// captures sit far from the origin, so scaling about the origin would fling them away.
				root.updateMatrixWorld(true);
				const centreBefore = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
				root.scale.setScalar(OVERLAY_SCALE);
				root.updateMatrixWorld(true);
				const centreAfter = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
				root.position.add(centreBefore.sub(centreAfter));
				root.updateMatrixWorld(true);

				const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
				const diagonal = size.length() || 1;

				// Raise it along Z.
				const lift = diagonal * OVERLAY_LIFT;
				root.position.z += lift;
				root.updateMatrixWorld(true);

				// Give any point clouds a visible point size relative to the (scaled) capture.
				root.traverse((object) => {
					const points = object as THREE.Points;
					if (!points.isPoints) return;
					const material = points.material as THREE.PointsMaterial;
					material.size = diagonal * 0.0008;
					material.sizeAttenuation = true;
				});

				scene.add(root);

				// Log where it landed so its scale/size/height are easy to read + tune.
				const centre = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
				const fmt = (vector: THREE.Vector3) =>
					vector
						.toArray()
						.map((value) => value.toFixed(1))
						.join(", ");
				console.log(
					`[GLB overlay] scale ${OVERLAY_SCALE}× · size (${fmt(size)}) · centre (${fmt(centre)}) · z-lift +${lift.toFixed(1)}`,
				);
			},
			(event) => {
				if (event.total) console.log(`GLB overlay ${Math.round((event.loaded / event.total) * 100)}%`);
			},
			(error) => console.error("GLB overlay failed to load:", error),
		);

		return () => {
			cancelled = true;
			if (!root) return;
			scene.remove(root);
			root.traverse((object) => {
				const mesh = object as THREE.Mesh;
				mesh.geometry?.dispose?.();
				const material = mesh.material;
				if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
				else material?.dispose?.();
			});
		};
	}, [src, visible, state.status, api]);
}
