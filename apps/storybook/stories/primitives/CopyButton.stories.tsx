import type {Meta, StoryObj} from "storybook/internal/types";

import {CopyButton} from "@corensystem/core-ui/copy-button";

const meta = {
	title: "Components/Primitives/Copy Button",
	component: CopyButton,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Ghost icon button that writes a string to the clipboard. Swaps to a green check on success for 1.5s (configurable). Used in Core's component demo pages next to titles and variant headers — pair it with a `wwc:group` parent and `wwc:opacity-0 wwc:group-hover:opacity-100` on the button to get a hover-reveal pattern.",
			},
		},
	},
	args: {
		value: "ToolCall",
	},
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InlineWithHeading: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-3">
			<h2 className="wwc:text-2xl wwc:font-bold">Tool Call</h2>
			<CopyButton value="Tool Call" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Sits next to a heading. The button stays at a fixed 32×32 footprint so the heading's baseline doesn't shift.",
			},
		},
	},
};

export const HoverReveal: Story = {
	render: () => (
		<div className="wwc:max-w-md wwc:space-y-2">
			<p className="wwc:text-sm wwc:text-muted-foreground">Hover the row below — the button only appears on hover.</p>
			<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3 wwc:rounded-md wwc:border wwc:px-3 wwc:py-2">
				<span className="wwc:text-sm wwc:font-semibold">Search Filter Bar</span>
				<CopyButton
					value="Search Filter Bar"
					className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
				/>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Wrap the row in a `wwc:group` parent and add `wwc:opacity-0 wwc:group-hover:opacity-100` on the button. `wwc:focus-visible:opacity-100` keeps it reachable for keyboard users.",
			},
		},
	},
};

export const CustomLabel: Story = {
	args: {value: "ssh-rsa AAAA...", label: "Copy public key"},
	parameters: {
		docs: {
			description: {
				story: "Override `label` when the value would be long, sensitive, or unhelpful as an aria-label.",
			},
		},
	},
};

export const FastReset: Story = {
	args: {value: "12345", resetMs: 500},
	parameters: {
		docs: {
			description: {
				story:
					"Tune `resetMs` to shorten/lengthen how long the success state shows before reverting. Default is 1500ms.",
			},
		},
	},
};

export const InAList: Story = {
	render: () => (
		<ul className="wwc:max-w-md wwc:divide-y wwc:rounded-md wwc:border">
			{["sk-live-1234567890abcdef", "sk-test-abcdefghij1234567", "rk-secret-9876543210xxxx"].map((token) => (
				<li key={token} className="wwc:flex wwc:items-center wwc:gap-2 wwc:px-3 wwc:py-2">
					<code className="wwc:flex-1 wwc:truncate wwc:font-mono wwc:text-xs">{token}</code>
					<CopyButton value={token} label="Copy token" />
				</li>
			))}
		</ul>
	),
	parameters: {
		docs: {
			description: {
				story: "Common pattern: a list of credentials/codes with a copy affordance per row.",
			},
		},
	},
};
