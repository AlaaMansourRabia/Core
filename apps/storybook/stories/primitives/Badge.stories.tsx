import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@corensystem/coren-ui/badge";
import {
	AllVariants as AllVariantsExample,
	CountBadge as CountBadgeExample,
	Default as DefaultExample,
	Destructive as DestructiveExample,
	Outline as OutlineExample,
	Secondary as SecondaryExample,
	SemanticColors as SemanticColorsExample,
	SeverityScale as SeverityScaleExample,
	Soft as SoftExample,
	StatusSemantics as StatusSemanticsExample,
	WhenNotToUse as WhenNotToUseExample,
	WithIcon as WithIconExample,
} from "@corensystem/coren-docs/examples/badge";

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

export const Default: Story = {
	parameters: {
		docs: {description: {story: "Default badge with primary styling."}},
	},
	render: () => <DefaultExample />,
};

export const Secondary: Story = {
	parameters: {
		docs: {description: {story: "Secondary variant with muted styling."}},
	},
	render: () => <SecondaryExample />,
};

export const Destructive: Story = {
	parameters: {
		docs: {description: {story: "Destructive variant for errors or critical states."}},
	},
	render: () => <DestructiveExample />,
};

export const Outline: Story = {
	parameters: {
		docs: {description: {story: "Outline variant with subtle border styling."}},
	},
	render: () => <OutlineExample />,
};

export const AllVariants: Story = {
	name: "All Variants",
	parameters: {
		docs: {description: {story: "Shows all 12 badge variants including solid fills and soft tinted styles."}},
	},
	render: () => <AllVariantsExample />,
};

export const SemanticColors: Story = {
	name: "Semantic Colors",
	parameters: {
		docs: {
			description: {
				story:
					"Filled semantic colors for definite states: `success` (green), `warning` (amber), `info` (blue), plus " +
					"`destructive` (red). Use a solid fill when the badge is the primary signal in its row.",
			},
		},
	},
	render: () => <SemanticColorsExample />,
};

export const Soft: Story = {
	name: "Soft",
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
	render: () => <SoftExample />,
};

export const SeverityScale: Story = {
	name: "Severity Scale",
	parameters: {
		docs: {
			description: {
				story:
					"A worked example: mapping a High / Medium / Low severity scale to soft variants so each level reads as its " +
					"own colored indicator rather than a generic dark fill.",
			},
		},
	},
	render: () => <SeverityScaleExample />,
};

export const StatusSemantics: Story = {
	name: "Status Semantics",
	parameters: {
		docs: {
			description: {
				story:
					"Map the variant to a *meaning*, consistently: `default` = active/positive, `secondary` = neutral/info, " +
					"`destructive` = error/blocked, `outline` = draft/low-emphasis. Pick by meaning, not by color.",
			},
		},
	},
	render: () => <StatusSemanticsExample />,
};

export const WithIcon: Story = {
	name: "With Icon",
	parameters: {
		docs: {description: {story: "Lead with a small icon to reinforce the status. Keep the label one or two words."}},
	},
	render: () => <WithIconExample />,
};

export const CountBadge: Story = {
	name: "Count Badge",
	parameters: {
		docs: {description: {story: "Numeric badges for counts. Cap large values (e.g. 99+) to keep width stable."}},
	},
	render: () => <CountBadgeExample />,
};

export const WhenNotToUse: Story = {
	name: "When Not To Use",
	parameters: {
		docs: {
			description: {
				story:
					"**Avoid** using a Badge as a button or a removable filter pill — a Badge is static and not focusable/clickable. " +
					"If the user can toggle or dismiss it, reach for `Chip` instead.",
			},
		},
	},
	render: () => <WhenNotToUseExample />,
};
