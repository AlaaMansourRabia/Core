import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@wakecap/core-ui/button";
import {CreateProcessDialog} from "@wakecap/core-ui/pages/create-process-dialog";
import {seedProcesses} from "@wakecap/core-ui/pages/wc3-process-views";
import {useState} from "react";

const meta = {
	title: "Widgets/Connect/Create Process Dialog",
	component: CreateProcessDialog,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Bind a new state machine to an ontology object type. The modal shell, the never-disable-Create rule and the reset-on-close behaviour all come from `FormDialog`; this widget carries only what is specific to a process — which object type backs it and therefore which rows become its tokens, which property on those rows holds the state value, and whether that object type is **already claimed** by another process. Tokens are keyed by object type rather than by process, so two processes on `ot_permit` share the same 28 rows; that is what the amber caveat is telling you. It hands back a *draft*, not a record, which is what lets a host build the record with `createProcess()` and drill straight into it without this dialog knowing how the host stores anything.",
			},
		},
	},
} satisfies Meta<typeof CreateProcessDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Press **Create process** on the empty form to see the never-disable rule. Then pick **Work Permit**
 * as the backing object type — it is already claimed by the shipped Digital Work Permit process, so
 * the shared-tokens caveat appears and the status property pre-fills by heuristic.
 */
export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [processes] = useState(() => seedProcesses());
		const [created, setCreated] = useState<string | null>(null);

		return (
			<div className="wwc:space-y-3 wwc:text-center">
				<Button onClick={() => setOpen(true)}>Create process</Button>
				{created ? <p className="wwc:text-xs wwc:text-muted-foreground">Last draft: {created}</p> : null}
				<CreateProcessDialog
					open={open}
					onOpenChange={setOpen}
					processes={processes}
					onCreate={(draft) => setCreated(`${draft.name} → ${draft.objectTypeId}.${draft.statusProp}`)}
				/>
			</div>
		);
	},
};
