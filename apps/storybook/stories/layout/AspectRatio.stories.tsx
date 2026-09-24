import type {Meta, StoryObj} from "storybook/internal/types";

import {AspectRatio} from "@corensystem/coren-ui/aspect-ratio";

const meta = {
	title: "Components/Layout/AspectRatio",
	component: AspectRatio,
	tags: ["autodocs"],
	argTypes: {
		ratio: {
			control: "number",
			description: "The desired ratio (width / height).",
		},
	},
	parameters: {
		docs: {
			description: {
				component:
					"Displays content within a desired aspect ratio. Built on Radix AspectRatio. Useful for images, videos, and maps.",
			},
		},
	},
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ratio16by9: Story = {
	args: {
		ratio: 16 / 9,
	},
	render: (args) => (
		<div className="wwc:w-[450px]">
			<AspectRatio ratio={args.ratio} className="wwc:bg-muted wwc:rounded-md wwc:overflow-hidden">
				<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:text-muted-foreground">
					16:9
				</div>
			</AspectRatio>
		</div>
	),
};

export const Square: Story = {
	render: () => (
		<div className="wwc:w-[300px]">
			<AspectRatio ratio={1} className="wwc:bg-muted wwc:rounded-md wwc:overflow-hidden">
				<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:text-muted-foreground">
					1:1
				</div>
			</AspectRatio>
		</div>
	),
};

export const Ratio4by3: Story = {
	render: () => (
		<div className="wwc:w-[400px]">
			<AspectRatio ratio={4 / 3} className="wwc:bg-muted wwc:rounded-md wwc:overflow-hidden">
				<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:text-muted-foreground">
					4:3
				</div>
			</AspectRatio>
		</div>
	),
};

export const WithImage: Story = {
	render: () => (
		<div className="wwc:w-[450px]">
			<AspectRatio ratio={16 / 9} className="wwc:bg-muted wwc:rounded-md wwc:overflow-hidden">
				<img
					src="https://placehold.co/800x450/e2e8f0/64748b?text=16:9+Image"
					alt="Placeholder"
					className="wwc:h-full wwc:w-full wwc:object-cover"
				/>
			</AspectRatio>
		</div>
	),
};

export const AllRatios: Story = {
	render: () => (
		<div className="wwc:grid wwc:grid-cols-3 wwc:gap-4 wwc:w-[600px]">
			{[
				{ratio: 1, label: "1:1"},
				{ratio: 4 / 3, label: "4:3"},
				{ratio: 16 / 9, label: "16:9"},
				{ratio: 21 / 9, label: "21:9"},
				{ratio: 3 / 4, label: "3:4"},
				{ratio: 9 / 16, label: "9:16"},
			].map(({ratio, label}) => (
				<div key={label}>
					<AspectRatio ratio={ratio} className="wwc:bg-muted wwc:rounded-md wwc:overflow-hidden">
						<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:text-muted-foreground wwc:text-sm">
							{label}
						</div>
					</AspectRatio>
					<p className="wwc:text-xs wwc:text-center wwc:mt-1 wwc:text-muted-foreground">{label}</p>
				</div>
			))}
		</div>
	),
};
