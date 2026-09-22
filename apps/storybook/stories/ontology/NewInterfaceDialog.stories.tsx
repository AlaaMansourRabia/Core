import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/core-ui/button";
import {NewInterfaceDialog} from "@corensystem/core-ui/new-interface-dialog";
import {useState} from "react";

const meta = {
	title: "Widgets/Ontology/New Interface Dialog",
	component: NewInterfaceDialog,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Author a shared ontology interface: name, description, status and what it extends. `requireDescription` enforces the best-practice rule and defaults to **false**, so hosts that already ship this dialog do not change behaviour when they adopt it from the library.",
			},
		},
	},
} satisfies Meta<typeof NewInterfaceDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Assembles a draft and hands it back; the host mints the id. */
export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [draft, setDraft] = useState<string | null>(null);
		return (
			<div className="wwc:space-y-3 wwc:text-center">
				<Button onClick={() => setOpen(true)}>New interface</Button>
				{draft ? <p className="wwc:text-xs wwc:text-muted-foreground">Draft: {draft}</p> : null}
				<NewInterfaceDialog
					open={open}
					onOpenChange={setOpen}
					onCreate={(d) => setDraft(JSON.stringify(d).slice(0, 120))}
				/>
			</div>
		);
	},
};
