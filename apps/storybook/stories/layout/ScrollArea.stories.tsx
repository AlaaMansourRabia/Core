import type {Meta, StoryObj} from "storybook/internal/types";

import {ScrollArea, ScrollBar} from "@core/core-ui/scroll-area";

const meta = {
	title: "Components/Layout/ScrollArea",
	component: ScrollArea,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A custom scrollable area with styled scrollbars. Built on Radix ScrollArea. Exports ScrollArea (container) and ScrollBar (for horizontal scrolling).",
			},
		},
	},
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const tags = Array.from({length: 50}, (_, i) => `Item ${i + 1}`);

export const Vertical: Story = {
	render: () => (
		<ScrollArea className="wwc:h-72 wwc:w-48 wwc:rounded-md wwc:border">
			<div className="wwc:p-4">
				<h4 className="wwc:mb-4 wwc:text-sm wwc:font-medium wwc:leading-none">Items</h4>
				{tags.map((tag) => (
					<div key={tag} className="wwc:text-sm wwc:py-1">
						{tag}
					</div>
				))}
			</div>
		</ScrollArea>
	),
};

export const Horizontal: Story = {
	render: () => (
		<ScrollArea className="wwc:w-96 wwc:whitespace-nowrap wwc:rounded-md wwc:border">
			<div className="wwc:flex wwc:w-max wwc:space-x-4 wwc:p-4">
				{Array.from({length: 20}, (_, i) => (
					<div
						key={i}
						className="wwc:flex wwc:h-20 wwc:w-32 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:bg-muted"
					>
						Card {i + 1}
					</div>
				))}
			</div>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	),
};

export const LongContent: Story = {
	render: () => (
		<ScrollArea className="wwc:h-[200px] wwc:w-[350px] wwc:rounded-md wwc:border wwc:p-4">
			<p className="wwc:text-sm wwc:leading-relaxed">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
				magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
				consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
				pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
				laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam
				rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
				Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
				eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
				consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam
				quaerat voluptatem.
			</p>
		</ScrollArea>
	),
};
