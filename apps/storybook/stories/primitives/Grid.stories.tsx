import type {Meta, StoryObj} from "storybook/internal/types";

import {Grid} from "@corensystem/core-ui/grid";

const meta = {
	title: "Components/Primitives/Grid",
	component: Grid,
	tags: ["autodocs"],
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

const Box = ({children}: {children: React.ReactNode}) => (
	<div className="wwc:h-20 wwc:bg-primary wwc:rounded wwc:flex wwc:items-center wwc:justify-center wwc:text-primary-foreground">
		{children}
	</div>
);

export const TwoColumns: Story = {
	render: () => (
		<Grid columns={2}>
			<Box>1</Box>
			<Box>2</Box>
			<Box>3</Box>
			<Box>4</Box>
		</Grid>
	),
};

export const ThreeColumns: Story = {
	render: () => (
		<Grid columns={3}>
			<Box>1</Box>
			<Box>2</Box>
			<Box>3</Box>
			<Box>4</Box>
			<Box>5</Box>
			<Box>6</Box>
		</Grid>
	),
};

export const FourColumns: Story = {
	render: () => (
		<Grid columns={4}>
			<Box>1</Box>
			<Box>2</Box>
			<Box>3</Box>
			<Box>4</Box>
			<Box>5</Box>
			<Box>6</Box>
			<Box>7</Box>
			<Box>8</Box>
		</Grid>
	),
};

export const CustomGap: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<Grid columns={3} gap="xs">
				<Box>XS</Box>
				<Box>Gap</Box>
				<Box>Size</Box>
			</Grid>
			<Grid columns={3} gap="md">
				<Box>MD</Box>
				<Box>Gap</Box>
				<Box>Size</Box>
			</Grid>
			<Grid columns={3} gap="xl">
				<Box>XL</Box>
				<Box>Gap</Box>
				<Box>Size</Box>
			</Grid>
		</div>
	),
};
