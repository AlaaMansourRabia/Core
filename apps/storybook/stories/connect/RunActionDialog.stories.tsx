import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@core/core-ui/button";
import {RunActionDialog} from "@core/core-ui/pages/run-action-dialog";
import {WC3_ACTION_TYPES} from "@core/core-ui/pages/wc3-ontology-data";
import {useState} from "react";

const ACTION = WC3_ACTION_TYPES[0] ?? null;

const meta = {
	title: "Widgets/Connect/Run Action Dialog",
	component: RunActionDialog,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Execute a typed ontology action. The parameter form is **generated from the action type** — static defaults are applied on open, `fromObjectProperty` defaults refill when their source parameter changes, and `objectRef` parameters get an instance picker when the host supplies `instancesFor` and a free-text input when it does not. The run is gated on the acting user's groups rather than trusted: a user outside the permitted set reaches the form but cannot run.",
			},
		},
	},
} satisfies Meta<typeof RunActionDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The acting user defaults to the ontology admin, who may run. */
export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setOpen(true)}>Run action</Button>
				<RunActionDialog open={open} onOpenChange={setOpen} actionType={ACTION} />
			</>
		);
	},
};

/** An acting user in no permitted group: the form is reachable, the run is not. */
export const NotPermitted: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button variant="outline" onClick={() => setOpen(true)}>
					Run as a viewer
				</Button>
				<RunActionDialog
					open={open}
					onOpenChange={setOpen}
					actionType={ACTION}
					actingUser={{name: "Site Viewer", groups: []}}
				/>
			</>
		);
	},
};
