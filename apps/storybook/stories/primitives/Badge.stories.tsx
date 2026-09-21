import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@wakecap/core-ui/badge";
import {Check, CircleAlert, Clock} from "lucide-react";

const meta = {
	title: "Components/Primitives/Badge",
	component: Badge,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: [
				"default",
				"secondary",
				"destructive",
				"outline",
				"success",
				"warning",
				"info",
				"successSoft",
				"warningSoft",
				"dangerSoft",
				"infoSoft",
				"neutralSoft",
			],
		},
	},
	args: {
		children: "Badge",
		variant: "default",
	},
	parameters: {
		docs: {
			description: {
				component:
					"A small, **static** status or label descriptor. **When to use:** label a status, category, or count next to " +
					"content (a row, a card title, a nav item). **When NOT to use:** if it's clickable/removable or toggles a filter, " +
					"use `Chip`; for a standalone count bubble on an icon, that's still a Badge but keep it short. Related: `Chip` " +
					"(interactive), `Avatar` (entity), `Alert`/`Banner` (messages).",
			},
		},
	},
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
	args: {variant: "secondary"},
};

export const Destructive: Story = {
	args: {variant: "destructive"},
};

export const Outline: Story = {
	args: {variant: "outline"},
};

export const AllVariants: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Badge variant="default">Default</Badge>
			<Badge variant="secondary">Secondary</Badge>
			<Badge variant="destructive">Destructive</Badge>
			<Badge variant="outline">Outline</Badge>
			<Badge variant="success">Success</Badge>
			<Badge variant="warning">Warning</Badge>
			<Badge variant="info">Info</Badge>
			<Badge variant="successSoft">Success soft</Badge>
			<Badge variant="warningSoft">Warning soft</Badge>
			<Badge variant="dangerSoft">Danger soft</Badge>
			<Badge variant="infoSoft">Info soft</Badge>
			<Badge variant="neutralSoft">Neutral soft</Badge>
		</div>
	),
};

export const SemanticColors: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Filled semantic colors for definite states: `success` (green), `warning` (amber), `info` (blue), plus " +
					"`destructive` (red). Use a solid fill when the badge is the primary signal in its row.",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Badge variant="success">Success</Badge>
			<Badge variant="warning">Warning</Badge>
			<Badge variant="info">Info</Badge>
			<Badge variant="destructive">Danger</Badge>
		</div>
	),
};

export const Soft: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Soft variants — a light tinted background with a colored stroke and text. Lower-emphasis 'indicator' tags " +
					"that sit calmly inside dense lists (e.g. severity on a row). Available as `successSoft`, `warningSoft`, " +
					"`dangerSoft`, `infoSoft`, and `neutralSoft`. They are theme-aware (readable in light and dark).",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Badge variant="successSoft">Verified</Badge>
			<Badge variant="warningSoft">Medium</Badge>
			<Badge variant="dangerSoft">High</Badge>
			<Badge variant="infoSoft">Low</Badge>
			<Badge variant="neutralSoft">Draft</Badge>
		</div>
	),
};

export const SeverityScale: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"A worked example: mapping a High / Medium / Low severity scale to soft variants so each level reads as its " +
					"own colored indicator rather than a generic dark fill.",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Badge variant="dangerSoft">High</Badge>
			<Badge variant="warningSoft">Medium</Badge>
			<Badge variant="infoSoft">Low</Badge>
		</div>
	),
};

export const StatusSemantics: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Map the variant to a *meaning*, consistently: `default` = active/positive, `secondary` = neutral/info, " +
					"`destructive` = error/blocked, `outline` = draft/low-emphasis. Pick by meaning, not by color.",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Badge variant="default">Active</Badge>
			<Badge variant="secondary">Pending</Badge>
			<Badge variant="destructive">Blocked</Badge>
			<Badge variant="outline">Draft</Badge>
		</div>
	),
};

export const WithIcon: Story = {
	parameters: {
		docs: {description: {story: "Lead with a small icon to reinforce the status. Keep the label one or two words."}},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Badge variant="default">
				<Check className="wwc:size-3" /> Verified
			</Badge>
			<Badge variant="secondary">
				<Clock className="wwc:size-3" /> In review
			</Badge>
			<Badge variant="destructive">
				<CircleAlert className="wwc:size-3" /> Failed
			</Badge>
		</div>
	),
};

export const CountBadge: Story = {
	parameters: {
		docs: {description: {story: "Numeric badges for counts. Cap large values (e.g. 99+) to keep width stable."}},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
			<Badge variant="secondary">3</Badge>
			<Badge variant="secondary">12</Badge>
			<Badge variant="destructive">99+</Badge>
		</div>
	),
};

export const WhenNotToUse: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"**Avoid** using a Badge as a button or a removable filter pill — a Badge is static and not focusable/clickable. " +
					"If the user can toggle or dismiss it, reach for `Chip` instead.",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:text-sm">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Badge variant="secondary">Static label</Badge>
				<span className="wwc:text-muted-foreground">✓ status / category / count</span>
			</div>
			<p className="wwc:text-destructive">✗ Don't wire onClick/remove onto a Badge — use Chip for interactive pills.</p>
		</div>
	),
};
