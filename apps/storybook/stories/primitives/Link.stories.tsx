import type {Meta, StoryObj} from "storybook/internal/types";

import {Link} from "@corensystem/coren-ui/link";

const meta = {
	title: "Components/Primitives/Link",
	component: Link,
	tags: ["autodocs"],
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <Link href="#">Default link</Link>,
};

export const Variants: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-4">
			<Link variant="default" href="#">
				Default link with underline on hover
			</Link>
			<Link variant="subtle" href="#">
				Subtle link changes color on hover
			</Link>
			<Link variant="muted" href="#">
				Muted link for less emphasis
			</Link>
		</div>
	),
};

export const InText: Story = {
	render: () => (
		<p className="wwc:text-sm">
			This is a paragraph with a <Link href="#">link inside it</Link> that demonstrates how links appear in running
			text.
		</p>
	),
};
