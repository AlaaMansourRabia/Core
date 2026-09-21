// Form Builder widget — RJSF edition. The full builder flow (list → build → preview → publish); the
// outputted form a respondent fills (the Preview) is rendered with react-jsonschema-form (RJSF).
import {BuilderFlow} from "./BuilderFlow";
import {FillerRJSF} from "./FillerRJSF";
import {permitInspectionForm, sampleForm} from "./model";
import type {FormSchema} from "./model";

export function FormBuilderWidgetRJSF({
	mode = "full",
	seedForms,
}: {
	mode?: "full" | "builder";
	/** Override the seeded forms (e.g. embedding in the Work Permit template). */
	seedForms?: FormSchema[];
}) {
	return (
		<BuilderFlow
			mode={mode}
			seedForms={seedForms ?? [sampleForm(), permitInspectionForm()]}
			listTitle="Forms"
			showDisplayMode={false}
			renderPreview={({schema, onExit, onComplete}) => (
				<FillerRJSF schema={schema} onExit={onExit} onComplete={onComplete} />
			)}
		/>
	);
}
