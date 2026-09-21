import type {Meta, StoryObj} from "storybook/internal/types";

import {Skeleton} from "@core/core-ui/skeleton";

const meta = {
	title: "Components/Primitives/Skeleton",
	component: Skeleton,
	tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <Skeleton className="wwc:h-4 wwc:w-[250px]" />,
};

export const Circle: Story = {
	render: () => <Skeleton className="wwc:h-12 wwc:w-12 wwc:rounded-full" />,
};

export const Card: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:space-y-3">
			<Skeleton className="wwc:h-[125px] wwc:w-[250px] wwc:rounded-xl" />
			<div className="wwc:space-y-2">
				<Skeleton className="wwc:h-4 wwc:w-[250px]" />
				<Skeleton className="wwc:h-4 wwc:w-[200px]" />
			</div>
		</div>
	),
};

export const ProfileCard: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:space-x-4">
			<Skeleton className="wwc:h-12 wwc:w-12 wwc:rounded-full" />
			<div className="wwc:space-y-2">
				<Skeleton className="wwc:h-4 wwc:w-[150px]" />
				<Skeleton className="wwc:h-4 wwc:w-[100px]" />
			</div>
		</div>
	),
};

export const TableRows: Story = {
	render: () => (
		<div className="wwc:space-y-3 wwc:w-[400px]">
			{Array.from({length: 5}).map((_, i) => (
				<div key={i} className="wwc:flex wwc:items-center wwc:space-x-4">
					<Skeleton className="wwc:h-10 wwc:w-10 wwc:rounded-md" />
					<div className="wwc:flex-1 wwc:space-y-2">
						<Skeleton className="wwc:h-4 wwc:w-full" />
						<Skeleton className="wwc:h-3 wwc:w-3/4" />
					</div>
				</div>
			))}
		</div>
	),
};
