import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/core-ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@corensystem/core-ui/drawer";

const meta = {
	title: "Components/Overlay/Drawer",
	component: Drawer,
	tags: ["autodocs"],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="outline">Open Drawer</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Drawer Title</DrawerTitle>
					<DrawerDescription>This is a bottom drawer powered by the vaul library.</DrawerDescription>
				</DrawerHeader>
				<div className="wwc:p-4">
					<p className="wwc:text-sm wwc:text-muted-foreground">Drawer body content goes here.</p>
				</div>
				<DrawerFooter>
					<Button>Submit</Button>
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	),
};

export const WithForm: Story = {
	render: () => (
		<Drawer>
			<DrawerTrigger asChild>
				<Button>Set Goal</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Set Your Daily Goal</DrawerTitle>
					<DrawerDescription>Configure your daily target to track progress.</DrawerDescription>
				</DrawerHeader>
				<div className="wwc:p-4">
					<div className="wwc:grid wwc:gap-4">
						<div className="wwc:grid wwc:gap-2">
							<label htmlFor="goal" className="wwc:text-sm wwc:font-medium">
								Goal
							</label>
							<input
								id="goal"
								type="number"
								defaultValue={10}
								className="wwc:rounded-md wwc:border wwc:px-3 wwc:py-2 wwc:text-sm"
							/>
						</div>
					</div>
				</div>
				<DrawerFooter>
					<Button>Save Goal</Button>
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	),
};

export const SimpleContent: Story = {
	render: () => (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="outline">View Details</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Details</DrawerTitle>
				</DrawerHeader>
				<div className="wwc:p-4">
					<p className="wwc:text-sm wwc:text-muted-foreground">
						This drawer shows simple content without a footer. Drag down or tap the overlay to close.
					</p>
				</div>
			</DrawerContent>
		</Drawer>
	),
};
