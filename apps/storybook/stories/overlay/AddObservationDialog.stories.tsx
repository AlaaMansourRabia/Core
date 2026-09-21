import type {Meta, StoryObj} from "storybook/internal/types";

import {AddObservationDialog, type AddObservationOption} from "@wakecap/core-ui/add-observation-dialog";
import {Button} from "@wakecap/core-ui/button";
import {Plus} from "lucide-react";
import {useState} from "react";

const ZONES: AddObservationOption[] = [
	{value: "mar-entrance", label: "MAR Entrance"},
	{value: "tcf-camp", label: "TR-PKG2-TCF Camp"},
	{value: "storage-metering", label: "TR-PKG2/887-Storage and Metering Area(34)-1"},
	{value: "level-3-zone-b", label: "Level 3 — Zone B"},
	{value: "laydown-yard", label: "Laydown Yard"},
];

const CATEGORIES: AddObservationOption[] = [
	{value: "ppe", label: "PPE Non-Compliance"},
	{value: "fall-protection", label: "Fall Protection"},
	{value: "vehicle-safety", label: "Vehicle & Traffic Safety"},
	{value: "housekeeping", label: "Housekeeping"},
	{value: "hot-work", label: "Hot Work"},
	{value: "unfit-for-work", label: "Unfit for Work"},
];

const WORKERS: AddObservationOption[] = [
	{value: "pa3623851", label: "Anil Pun Magar (PA3623851)"},
	{value: "2267834220", label: "Muhamed Shihab (2267834220)"},
	{value: "2607463938", label: "Worker 2607463938"},
];

const meta = {
	title: "Components/Overlay/AddObservationDialog",
	component: AddObservationDialog,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Form for logging a safety observation. A dialog rather than a sheet because the entry is a short, " +
					"self-contained commit — the operator is not referencing the list behind it while filling it in, so the " +
					"modal focus is an asset. The eight fields pair into a two-column grid; Description and Attachments span " +
					"the full width since both need the room. Zone, Category, and Description are required — Save stays " +
					"disabled until all three are set. State resets on every open so a cancelled entry never bleeds into the " +
					"next one.",
			},
		},
	},
} satisfies Meta<typeof AddObservationDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Icon-button trigger, matching the "Add observation" action in the Safety Manager list header. */
export const Default: Story = {
	args: {
		zones: ZONES,
		categories: CATEGORIES,
		workers: WORKERS,
		trigger: (
			<Button variant="outline" icon aria-label="Add observation" tooltip="Add observation" className="wwc:h-8 wwc:w-8">
				<Plus className="wwc:h-4 wwc:w-4" />
			</Button>
		),
	},
};

/** No option data wired up — every select falls back to its empty message. */
export const WithoutOptions: Story = {
	args: {
		trigger: <Button variant="outline">Add Observation</Button>,
	},
};

/** Controlled: the parent owns `open` and reads the saved payload. */
export const Controlled: Story = {
	args: {zones: ZONES, categories: CATEGORIES, workers: WORKERS},
	render: (args) => {
		const [open, setOpen] = useState(false);
		const [last, setLast] = useState<string>();

		return (
			<div className="wwc:space-y-3">
				<Button onClick={() => setOpen(true)}>Open add observation</Button>
				<AddObservationDialog
					{...args}
					open={open}
					onOpenChange={setOpen}
					onSave={(value) =>
						setLast(JSON.stringify({...value, attachments: value.attachments.map((f) => f.name)}, null, 2))
					}
				/>
				{last && <pre className="wwc:rounded wwc:bg-muted wwc:p-2 wwc:text-[11px]">{last}</pre>}
			</div>
		);
	},
};
