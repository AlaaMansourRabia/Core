import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {ExportDialog, type ExportTemplateOption} from "@corensystem/coren-ui/export-dialog";
import {Download} from "lucide-react";
import {useState} from "react";

const TEMPLATES: ExportTemplateOption[] = [
	{
		id: "incident-log",
		label: "Incident log",
		description: "One row per observation with status, severity, and source.",
		fileType: "excel",
		includeFilters: true,
	},
	{
		id: "weekly-summary",
		label: "Weekly safety summary",
		description: "Counts by status and severity for the period.",
		fileType: "pdf",
		includeFilters: false,
	},
	{
		id: "contractor-breakdown",
		label: "Contractor breakdown",
		description: "Observations grouped by company.",
		fileType: "excel",
		includeFilters: false,
	},
];

const meta = {
	title: "Components/Overlay/ExportDialog",
	component: ExportDialog,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Export configuration dialog: file type (PDF/Excel), whether the surface's active filters narrow the " +
					"export, and a saved template or a new one to generate. It only collects the selection — the consumer " +
					"performs the export in `onExport`. A dialog rather than a dropdown because the four choices need to be " +
					"seen together before committing. Authoring a template is a separate flow — `onCreateTemplate` renders " +
					'the bottom-left "New template" action and hands off.',
			},
		},
	},
} satisfies Meta<typeof ExportDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Icon-button trigger, saved templates available, three filters active on the host surface. */
export const Default: Story = {
	args: {
		templates: TEMPLATES,
		activeFilterCount: 3,
		onCreateTemplate: () => undefined,
		trigger: (
			<Button variant="outline" icon aria-label="Export" tooltip="Export" className="wwc:h-8 wwc:w-8">
				<Download className="wwc:h-4 wwc:w-4" />
			</Button>
		),
	},
};

/** No saved templates — only "generate a new template" is offered, and Export stays disabled until it is named. */
export const WithoutSavedTemplates: Story = {
	args: {
		trigger: <Button variant="outline">Export</Button>,
	},
};

/** Controlled: the parent owns `open` and reads the submission. */
export const Controlled: Story = {
	args: {templates: TEMPLATES},
	render: (args) => {
		const [open, setOpen] = useState(false);
		const [last, setLast] = useState<string>();

		return (
			<div className="wwc:space-y-3">
				<Button onClick={() => setOpen(true)}>Open export dialog</Button>
				<ExportDialog
					{...args}
					open={open}
					onOpenChange={setOpen}
					onExport={(submission) => setLast(JSON.stringify(submission, null, 2))}
				/>
				{last && <pre className="wwc:rounded wwc:bg-muted wwc:p-2 wwc:text-[11px]">{last}</pre>}
			</div>
		);
	},
};
