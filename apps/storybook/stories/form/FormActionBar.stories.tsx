import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@core/core-ui/button";
import {FormActionBar} from "@core/core-ui/form-action-bar";
import {Input} from "@core/core-ui/input";
import {Label} from "@core/core-ui/label";
import {Save} from "lucide-react";
import * as React from "react";

const meta = {
	title: "Components/Forms/FormActionBar",
	component: FormActionBar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Page-level form footer: status on the left, actions on the right. It owns its own full-bleed background, " +
					"top border, and upward shadow — so render it as a **sibling of the padded content container, not a child " +
					"of it**. Put the padding on an inner content div and leave the scroll region unpadded; that way the bar " +
					"never has to cancel shell padding with negative margins.",
			},
		},
	},
	args: {
		status: "3 unsaved changes",
	},
} satisfies Meta<typeof FormActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The correct layout: unpadded scroll region, padded inner div, bar as its sibling. */
function FormShell({children, rows = 12}: {children: React.ReactNode; rows?: number}) {
	return (
		<div className="wwc:flex wwc:h-[320px] wwc:flex-col wwc:overflow-auto wwc:rounded-lg wwc:border">
			<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1200px] wwc:flex-1 wwc:space-y-4 wwc:p-6">
				{Array.from({length: rows}, (_, i) => (
					<div key={i} className="wwc:space-y-1.5">
						<Label required={i === 0}>Field {i + 1}</Label>
						<Input placeholder={`Value ${i + 1}`} required={i === 0} />
					</div>
				))}
			</div>
			{children}
		</div>
	);
}

export const Default: Story = {
	render: (args) => (
		<FormShell>
			<FormActionBar {...args}>
				<Button variant="ghost" size="sm">
					Discard
				</Button>
				<Button size="sm">
					<Save className="wwc:h-4 wwc:w-4" />
					Save changes
				</Button>
			</FormActionBar>
		</FormShell>
	),
};

export const CreateMode: Story = {
	args: {status: "New role — not saved yet"},
	render: Default.render,
};

export const RichStatus: Story = {
	args: {
		status: (
			<>
				<span className="wwc:font-medium wwc:text-foreground">3</span> unsaved changes
			</>
		),
	},
	render: Default.render,
};

export const NotSticky: Story = {
	args: {sticky: false},
	parameters: {
		docs: {
			description: {
				story: "`sticky={false}` renders the bar in normal flow — for panels that already clip their own content.",
			},
		},
	},
	render: (args) => (
		<FormShell rows={2}>
			<FormActionBar {...args}>
				<Button size="sm">Save changes</Button>
			</FormActionBar>
		</FormShell>
	),
};

export const ActionsOnly: Story = {
	args: {status: undefined},
	render: (args) => (
		<FormShell rows={3}>
			<FormActionBar {...args}>
				<Button variant="ghost" size="sm">
					Cancel
				</Button>
				<Button size="sm">Save</Button>
			</FormActionBar>
		</FormShell>
	),
};
