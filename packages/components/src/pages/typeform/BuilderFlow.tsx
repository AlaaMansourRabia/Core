import type {ReactNode} from "react";

// The builder-flow orchestrator with a PLUGGABLE preview: forms list → build-method → builder →
// publish, with a Preview overlay whose contents the caller supplies via `renderPreview`. This is
// what lets the two engine widgets (RHF / RJSF) share the identical authoring UI while swapping ONLY
// the outputted form (the preview a respondent fills). No outer workspace shell — drops into a widget.
import {useMemo, useState} from "react";

import {BuilderScreen} from "./BuilderScreen";
import {BuildMethodScreen} from "./BuildMethodScreen";
import {makeForm} from "./model";
import type {FormSchema} from "./model";
import {PublishScreen} from "./PublishScreen";
import {useFormBuilder} from "./useFormBuilder";
import {WorkspaceScreen} from "./WorkspaceScreen";
import type {SavedFormMeta} from "./WorkspaceScreen";

export interface BuilderFlowPreviewArgs {
	schema: FormSchema;
	onExit: () => void;
	onComplete: (values: Record<string, unknown>) => void;
}

export interface BuilderFlowProps {
	/** Forms shown in the list initially (the first one is the active edit target). */
	seedForms: FormSchema[];
	listTitle?: string;
	showSuggestions?: boolean;
	/** Show the Publish "Respondent view" (one-question/list) selector. Off when the preview is always single-page. */
	showDisplayMode?: boolean;
	/**
	 * "full" (default) is the whole app: forms table → build-method → builder → publish → preview.
	 * "builder" is the builder ONLY — it opens on the build-method chooser (the three starting cards)
	 * and then the builder, with NO forms table and NO Publish button; display mode (when enabled)
	 * moves to the toolbar toggle instead of the Publish screen. Mirrors how the Work Permit template
	 * embeds the builder.
	 */
	mode?: "full" | "builder";
	/** Supplies the Preview overlay's contents — this is where each widget injects its engine's filler. */
	renderPreview: (args: BuilderFlowPreviewArgs) => ReactNode;
}

type View = "list" | "method" | "builder" | "publish";

export function BuilderFlow({
	seedForms,
	listTitle = "Forms",
	showSuggestions = false,
	showDisplayMode = true,
	mode = "full",
	renderPreview,
}: BuilderFlowProps) {
	const builderOnly = mode === "builder";
	const [seeds] = useState<FormSchema[]>(() => (seedForms.length > 0 ? seedForms : [makeForm()]));
	const builder = useFormBuilder(seeds[0]);
	const [savedForms, setSavedForms] = useState<FormSchema[]>(() => seeds);
	// Builder-only opens on the build-method chooser (the three starting cards) so authors pick a
	// starting point rather than dropping into a pre-filled form; full mode opens on the forms table.
	const [view, setView] = useState<View>(builderOnly ? "method" : "list");
	const [previewing, setPreviewing] = useState(false);
	const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});

	const active = builder.schema;
	const activeResponses = responseCounts[active.id] ?? 0;

	function persist(schema: FormSchema) {
		setSavedForms((prev) => {
			const i = prev.findIndex((f) => f.id === schema.id);
			if (i >= 0) {
				const copy = [...prev];
				copy[i] = schema;
				return copy;
			}
			return [...prev, schema];
		});
	}

	const forms: SavedFormMeta[] = useMemo(
		() =>
			savedForms.map((f) => ({
				id: f.id,
				title: f.title,
				questionCount: f.questions.length,
				responses: responseCounts[f.id] ?? 0,
				updated: "Just now",
			})),
		[savedForms, responseCounts],
	);

	function openForm(id: string) {
		const f = savedForms.find((x) => x.id === id);
		if (f) {
			builder.setSchema(f);
			setView("builder");
		}
	}
	function startFromScratch() {
		const fresh = makeForm("Untitled form");
		builder.setSchema(fresh);
		persist(fresh);
		setView("builder");
	}
	function seedFromQuestions(questions: FormSchema["questions"]) {
		const fresh: FormSchema = {...makeForm("Untitled form"), questions};
		builder.setSchema(fresh);
		persist(fresh);
		setView("builder");
	}
	function completeResponse() {
		setResponseCounts((prev) => ({...prev, [active.id]: (prev[active.id] ?? 0) + 1}));
	}

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:w-full wwc:flex-col wwc:bg-background">
			{view === "list" ? (
				<WorkspaceScreen
					title={listTitle}
					showSuggestions={showSuggestions}
					forms={forms}
					onCreate={() => setView("method")}
					onOpen={openForm}
				/>
			) : view === "method" ? (
				<BuildMethodScreen
					onStartFromScratch={startFromScratch}
					onSeed={seedFromQuestions}
					// Builder-only has no forms table to return to — cancel drops into a blank builder.
					onCancel={() => (builderOnly ? startFromScratch() : setView("list"))}
				/>
			) : view === "publish" ? (
				<PublishScreen
					form={active}
					responseCount={activeResponses}
					displayMode={active.displayMode}
					onDisplayModeChange={(m) => builder.setMeta({displayMode: m})}
					showDisplayMode={showDisplayMode}
					onPreview={() => setPreviewing(true)}
					onBackToEditor={() => setView("builder")}
				/>
			) : (
				<BuilderScreen
					builder={builder}
					onPreview={() => setPreviewing(true)}
					// Builder-only: no forms table to go back to, and no Publish step (assumed autosave).
					// Display mode (when enabled) moves to the toolbar toggle instead of the Publish screen.
					onBack={
						builderOnly
							? undefined
							: () => {
									persist(active);
									setView("list");
								}
					}
					onPublish={
						builderOnly
							? undefined
							: () => {
									persist(active);
									setView("publish");
								}
					}
					showDisplayModeToggle={builderOnly && showDisplayMode}
				/>
			)}

			{previewing ? (
				<div className="wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-background">
					{renderPreview({
						schema: active,
						onExit: () => setPreviewing(false),
						onComplete: completeResponse,
					})}
				</div>
			) : null}
		</div>
	);
}
