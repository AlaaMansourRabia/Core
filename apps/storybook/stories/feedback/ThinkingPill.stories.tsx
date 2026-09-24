import type {Meta, StoryObj} from "storybook/internal/types";

import {ThinkingPill} from "@corensystem/coren-ui/thinking-pill";
import {LineChart, Search, Sparkles} from "lucide-react";

const meta = {
	title: "Components/Feedback/Thinking Pill",
	component: ThinkingPill,
	tags: ["autodocs"],
	argTypes: {
		label: {control: "text"},
	},
	args: {
		label: "Thinking",
	},
	parameters: {
		docs: {
			description: {
				component:
					"Inline indicator that an agent is actively processing before any output has appeared. Mount/unmount, don't toggle. Lifetime = request started → first byte/event received. Default icon is a Brain glyph; override via the `icon` prop to match the activity (Sparkles for generation, Search for research, LineChart for analysis, etc.).",
			},
		},
	},
} satisfies Meta<typeof ThinkingPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Generating: Story = {
	args: {label: "Generating", icon: <Sparkles className="wwc:h-3.5 wwc:w-3.5" />},
};
export const Researching: Story = {
	args: {label: "Researching", icon: <Search className="wwc:h-3.5 wwc:w-3.5" />},
};
export const Analysing: Story = {
	args: {label: "Analysing", icon: <LineChart className="wwc:h-3.5 wwc:w-3.5" />},
};

export const AllLabels: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
			<ThinkingPill />
			<ThinkingPill label="Generating" icon={<Sparkles className="wwc:h-3.5 wwc:w-3.5" />} />
			<ThinkingPill label="Researching" icon={<Search className="wwc:h-3.5 wwc:w-3.5" />} />
			<ThinkingPill label="Analysing" icon={<LineChart className="wwc:h-3.5 wwc:w-3.5" />} />
		</div>
	),
};
