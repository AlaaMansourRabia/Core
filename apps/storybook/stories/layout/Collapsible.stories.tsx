import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@core/core-ui/button";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@core/core-ui/collapsible";
import {ChevronsUpDown} from "lucide-react";

const meta = {
	title: "Components/Layout/Collapsible",
	component: Collapsible,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"An interactive component that expands and collapses content. Built on Radix Collapsible with sub-components: Collapsible, CollapsibleTrigger, and CollapsibleContent.",
			},
		},
	},
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Collapsible className="wwc:w-[350px] wwc:space-y-2">
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:space-x-4 wwc:px-4">
				<h4 className="wwc:text-sm wwc:font-semibold">@peduarte starred 3 repositories</h4>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="sm">
						<ChevronsUpDown className="wwc:h-4 wwc:w-4" />
						<span className="wwc:sr-only">Toggle</span>
					</Button>
				</CollapsibleTrigger>
			</div>
			<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-2 wwc:font-mono wwc:text-sm wwc:shadow-sm">
				@radix-ui/primitives
			</div>
			<CollapsibleContent className="wwc:space-y-2">
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-2 wwc:font-mono wwc:text-sm wwc:shadow-sm">
					@radix-ui/colors
				</div>
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-2 wwc:font-mono wwc:text-sm wwc:shadow-sm">
					@stitches/react
				</div>
			</CollapsibleContent>
		</Collapsible>
	),
};

export const DefaultOpen: Story = {
	render: () => (
		<Collapsible defaultOpen className="wwc:w-[350px] wwc:space-y-2">
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:space-x-4 wwc:px-4">
				<h4 className="wwc:text-sm wwc:font-semibold">Expanded by default</h4>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="sm">
						<ChevronsUpDown className="wwc:h-4 wwc:w-4" />
						<span className="wwc:sr-only">Toggle</span>
					</Button>
				</CollapsibleTrigger>
			</div>
			<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-2 wwc:font-mono wwc:text-sm wwc:shadow-sm">
				Always visible
			</div>
			<CollapsibleContent className="wwc:space-y-2">
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-2 wwc:font-mono wwc:text-sm wwc:shadow-sm">
					Revealed item 1
				</div>
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-2 wwc:font-mono wwc:text-sm wwc:shadow-sm">
					Revealed item 2
				</div>
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-2 wwc:font-mono wwc:text-sm wwc:shadow-sm">
					Revealed item 3
				</div>
			</CollapsibleContent>
		</Collapsible>
	),
};

export const Disabled: Story = {
	render: () => (
		<Collapsible disabled className="wwc:w-[350px] wwc:space-y-2">
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:space-x-4 wwc:px-4">
				<h4 className="wwc:text-sm wwc:font-semibold">Disabled collapsible</h4>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="sm" disabled>
						<ChevronsUpDown className="wwc:h-4 wwc:w-4" />
						<span className="wwc:sr-only">Toggle</span>
					</Button>
				</CollapsibleTrigger>
			</div>
			<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-2 wwc:font-mono wwc:text-sm wwc:shadow-sm">
				Always visible
			</div>
			<CollapsibleContent className="wwc:space-y-2">
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-2 wwc:font-mono wwc:text-sm wwc:shadow-sm">
					Hidden item
				</div>
			</CollapsibleContent>
		</Collapsible>
	),
};
