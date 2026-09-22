import type {FragmentMarker} from "@core/core-ui/fragment-viewer";

import {Badge} from "@core/core-ui/badge";
import {
	FragmentViewer,
	FragmentViewerProvider,
	useFragmentViewer,
	type FragmentSelection,
} from "@core/core-ui/fragment-viewer";
import {SiteReality} from "@core/core-ui/pages/core-site-reality";
import {PropertyList, PropertyRow} from "@core/core-ui/property-list";
import {SectionPanel} from "@core/core-ui/section-panel";
import {ViewerToolbar} from "@core/core-ui/viewer-toolbar";
import workerUrl from "@thatopen/fragments/worker?url";
import {Scan} from "lucide-react";
import {useEffect, useState} from "react";

import {sampleDemoWorkers} from "./demo-workers";

// Site Reality with its map stage filled by a real model, plus the viewer toolbar and the panels it
// switches. The template owns no 3D: it takes `stage` and `contextHeader`, and this file decides
// what goes in them — which is exactly the split that lets the toolbar live outside the viewer.
//
// Models are served from public/models — a local-only, gitignored folder of symlinks (the WC3
// example dataset plus anything converted locally). Without it the viewer shows its "Model failed
// to load" state, which is the intended behaviour.
//
// uptown.frag is UpTown.ifc (IFC2X3, 253 MB) converted with IfcImporter to 24.5 MB of Fragments. The viewer reads .frag only — IFC is converted ahead of time so the browser
// never carries web-ifc's 23 MB of wasm.
const MODEL_SRC = "/models/uptown.frag";

/** Props panel — whatever is currently picked in the model. */
function PropsPanel({selection}: {selection: FragmentSelection | null}) {
	return (
		<SectionPanel
			icon={Scan}
			title="Props"
			count={selection?.itemCount ? <Badge variant="secondary">{selection.itemCount}</Badge> : undefined}
		>
			{!selection || selection.itemCount === 0 ? (
				<p className="text-xs text-muted-foreground">Click an element in the model.</p>
			) : (
				<PropertyList labelWidth="5.5rem">
					<PropertyRow label="Category">{selection.category ?? "Unknown"}</PropertyRow>
					<PropertyRow label="Selected">{selection.itemCount}</PropertyRow>
					<PropertyRow label="GUID">
						<span className="break-all font-mono text-xs">{selection.guid ?? "—"}</span>
					</PropertyRow>
				</PropertyList>
			)}
		</SectionPanel>
	);
}

/**
 * The stage: the canvas filling it, with the toolbar floating over the bottom. Floating rather than
 * docked because the template already owns the top corners of the stage for its panel toggles, and
 * because a BIM toolbar reads better over the model than above it.
 */
/**
 * Demo workers, drawn once the model is ready. Fewer than the 5,249 the stat strip claims: at full
 * count the spheres read as noise over the geometry rather than as people on floors.
 */
const DEMO_WORKER_COUNT = 1400;

function useDemoWorkers(): FragmentMarker[] {
	const {state, api} = useFragmentViewer();
	const [workers, setWorkers] = useState<FragmentMarker[]>([]);

	useEffect(() => {
		if (state.status !== "ready" || workers.length) return;
		const components = api.viewport()?.components;
		if (!components) return;
		let cancelled = false;
		void sampleDemoWorkers(components, {count: DEMO_WORKER_COUNT}).then((next) => {
			if (!cancelled) setWorkers(next);
		});
		return () => {
			cancelled = true;
		};
	}, [state.status, api, workers.length]);

	return workers;
}

function Stage() {
	const workers = useDemoWorkers();
	return (
		// Inline rather than a utility class: this is structural plumbing for the canvas, and it must
		// hold regardless of whether the host app's Tailwind emitted the class.
		<div style={{position: "absolute", inset: 0}}>
			<FragmentViewer
				src={MODEL_SRC}
				fallbackSrc="/models/vd2.frag"
				modelId="uptown"
				workerUrl={workerUrl}
				markers={workers}
				showLogo={false}
			/>
			<div
				style={{
					// Full width so the toolbar can measure the stage and pick its own density, but
					// zero-height so the wrapper has no hit area over the canvas — the toolbar child
					// overflows upward and is the only thing that receives clicks.
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 44,
					height: 0,
					display: "flex",
					justifyContent: "center",
					alignItems: "flex-end",
				}}
			>
				<ViewerToolbar className="max-w-full shadow-lg" />
			</div>
		</div>
	);
}

/** The context column always shows Props: it fills in as soon as an element is selected. */
function ContextHeader() {
	const {state} = useFragmentViewer();
	return <PropsPanel selection={state.selection} />;
}

export function SiteRealityStage() {
	return (
		<FragmentViewerProvider>
			<SiteReality stage={<Stage />} contextHeader={<ContextHeader />} />
		</FragmentViewerProvider>
	);
}
