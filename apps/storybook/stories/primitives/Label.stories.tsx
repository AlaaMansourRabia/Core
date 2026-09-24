import type {Meta, StoryObj} from "storybook/internal/types";

import {Label} from "@corensystem/coren-ui/label";
import {
	Default as DefaultExample,
	PeerDisabled,
	Required,
	WithInput,
} from "@corensystem/coren-docs/examples/label";

const meta = {
	title: "Components/Primitives/Label",
	component: Label,
	tags: ["autodocs"],
	args: {
		children: "Label text",
	},
	parameters: {
		docs: {
			description: {
				component:
					"An accessible label bound to a form control. Essential for usability and screen reader support. " +
					"Always pair form controls with a Label using htmlFor/id binding.",
			},
		},
	},
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {description: {story: "Default label with standard styling."}},
	},
	render: () => <DefaultExample />,
};

export const WithInputStory: Story = {
	name: "With Input",
	parameters: {
		docs: {description: {story: "Label bound to an input using htmlFor/id. This is the standard accessible pattern."}},
	},
	render: () => <WithInput />,
};

export const RequiredStory: Story = {
	name: "Required",
	parameters: {
		docs: {
			description: {
				story: "Use the required prop to show an asterisk. Also mark the input required for accessibility.",
			},
		},
	},
	render: () => <Required />,
};

export const PeerDisabledStory: Story = {
	name: "Peer Disabled",
	parameters: {
		docs: {
			description: {
				story:
					"The label dims when its peer input is disabled. The input must be a preceding sibling with the peer class; " +
					"flex-col-reverse keeps the label visually on top.",
			},
		},
	},
	render: () => <PeerDisabled />,
};
