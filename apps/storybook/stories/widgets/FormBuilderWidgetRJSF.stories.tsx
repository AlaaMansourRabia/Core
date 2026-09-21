import type {Meta, StoryObj} from "storybook/internal/types";

// Full Typeform-style builder flow (list → build → preview → publish). The OUTPUTTED form — the
// Preview a respondent fills — is rendered with react-jsonschema-form (RJSF). Compare with "— RHF".
import {FormBuilderWidgetRJSF} from "../../../../packages/components/src/pages/typeform/FormBuilderWidgetRJSF";

const meta = {
	title: "Widgets/Form Builder — RJSF",
	component: FormBuilderWidgetRJSF,
	tags: ["autodocs"],
	// The flow roots with h-full; give it the viewport so it fills like a real app.
	decorators: [
		(Story) => (
			<div style={{height: "100vh"}}>
				<Story />
			</div>
		),
	],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The whole form builder as a widget. Build a form, then Preview — the form a respondent fills is rendered by RJSF (react-jsonschema-form + ajv8) from a JSON Schema compiled from the builder. Same authoring UI as the RHF edition; only the preview engine differs.",
			},
		},
	},
} satisfies Meta<typeof FormBuilderWidgetRJSF>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The whole app: forms table → build → preview → publish. */
export const FullApp: Story = {args: {mode: "full"}};

/** Builder only — opens on the build-method chooser (the three starting cards), then the builder: no forms table, no Publish button. */
export const BuilderOnly: Story = {args: {mode: "builder"}};
