import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {NewSharedPropertyDialog} from "@corensystem/coren-ui/new-shared-property-dialog";
import {useState} from "react";

const meta = {
	title: "Widgets/Ontology/New Shared Property Dialog",
	component: NewSharedPropertyDialog,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Author a property reused across object types. Validation is a **prop**: the default is display-name-required, and a host needing more — a required API name, a uniqueness check — passes the full rule set in the order it wants them reported.",
			},
		},
	},
} satisfies Meta<typeof NewSharedPropertyDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Assembles a draft and hands it back; the host mints the id. */
export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [draft, setDraft] = useState<string | null>(null);
		return (
			<div className="wwc:space-y-3 wwc:text-center">
				<Button onClick={() => setOpen(true)}>New shared property</Button>
				{draft ? <p className="wwc:text-xs wwc:text-muted-foreground">Draft: {draft}</p> : null}
				<NewSharedPropertyDialog
					open={open}
					onOpenChange={setOpen}
					onCreate={(d) => setDraft(JSON.stringify(d).slice(0, 120))}
				/>
			</div>
		);
	},
};
