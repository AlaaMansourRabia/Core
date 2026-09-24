import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {Checkbox} from "@corensystem/coren-ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@corensystem/coren-ui/dialog";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";
import {
	Stepper,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperLabel,
	StepperList,
} from "@corensystem/coren-ui/stepper";
import {cn} from "@corensystem/coren-utils";
import {Minus, Plus, User, Users} from "lucide-react";
import * as React from "react";

const STEPS = [
	{step: 1, label: "Details"},
	{step: 2, label: "Availability"},
	{step: 3, label: "Attendees"},
	{step: 4, label: "Notifications"},
	{step: 5, label: "More Options"},
];

const meta = {
	title: "Components/Navigation/Stepper",
	component: Stepper,
	tags: ["autodocs"],
	argTypes: {
		value: {control: {type: "range", min: 1, max: 5, step: 1}},
		orientation: {control: {type: "radio"}, options: ["vertical", "horizontal"]},
	},
	args: {
		value: 3,
		orientation: "vertical",
	},
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
	render: (args) => (
		<Stepper value={args.value} orientation="vertical" className="wwc:w-[220px]">
			<StepperList>
				{STEPS.map(({step, label}) => (
					<StepperItem key={step} step={step}>
						<StepperIndicator />
						<StepperLabel>{label}</StepperLabel>
					</StepperItem>
				))}
			</StepperList>
		</Stepper>
	),
};

export const Horizontal: Story = {
	args: {orientation: "horizontal"},
	render: (args) => (
		<Stepper value={args.value} orientation="horizontal" className="wwc:w-[640px]">
			<StepperList>
				{STEPS.map(({step, label}) => (
					<StepperItem key={step} step={step} className="wwc:flex-1">
						<StepperIndicator />
						<StepperLabel>{label}</StepperLabel>
					</StepperItem>
				))}
			</StepperList>
		</Stepper>
	),
};

export const WithDescription: Story = {
	render: (args) => (
		<Stepper value={args.value} orientation="vertical" className="wwc:w-[280px]">
			<StepperList>
				{[
					{step: 1, label: "Details", description: "Title, dates, location"},
					{step: 2, label: "Availability", description: "When you're free"},
					{step: 3, label: "Attendees", description: "Who can book"},
					{step: 4, label: "Notifications", description: "Reminders & alerts"},
					{step: 5, label: "More Options", description: "Advanced settings"},
				].map(({step, label, description}) => (
					<StepperItem key={step} step={step} className="wwc:items-start">
						<StepperIndicator />
						<div className="wwc:flex wwc:flex-col wwc:gap-1">
							<StepperLabel>{label}</StepperLabel>
							<StepperDescription>{description}</StepperDescription>
						</div>
					</StepperItem>
				))}
			</StepperList>
		</Stepper>
	),
};

const AttendeesPanel = () => {
	const [selected, setSelected] = React.useState<"one" | "multiple">("multiple");
	const [maxAttendees, setMaxAttendees] = React.useState(10);

	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-5">
			<div className="wwc:flex wwc:flex-col wwc:gap-2">
				<Label>How many attendees?</Label>
				<div className="wwc:grid wwc:grid-cols-2 wwc:gap-3">
					<button
						type="button"
						onClick={() => setSelected("one")}
						className={cn(
							"wwc:flex wwc:flex-col wwc:items-start wwc:gap-2 wwc:rounded-lg wwc:border wwc:p-4 wwc:text-left wwc:transition-colors wwc:hover:bg-accent",
							selected === "one" ? "wwc:border-primary wwc:ring-1 wwc:ring-primary" : "wwc:border-input",
						)}
					>
						<User className="wwc:h-5 wwc:w-5" />
						<div>
							<div className="wwc:text-sm wwc:font-semibold">One attendee</div>
							<div className="wwc:text-xs wwc:text-muted-foreground">Interviews, 1-1s, check-ins</div>
						</div>
					</button>
					<button
						type="button"
						onClick={() => setSelected("multiple")}
						className={cn(
							"wwc:flex wwc:flex-col wwc:items-start wwc:gap-2 wwc:rounded-lg wwc:border wwc:p-4 wwc:text-left wwc:transition-colors wwc:hover:bg-accent",
							selected === "multiple" ? "wwc:border-primary wwc:ring-1 wwc:ring-primary" : "wwc:border-input",
						)}
					>
						<Users className="wwc:h-5 wwc:w-5" />
						<div>
							<div className="wwc:text-sm wwc:font-semibold">Multiple attendees</div>
							<div className="wwc:text-xs wwc:text-muted-foreground">Classes, office hours</div>
						</div>
					</button>
				</div>
			</div>

			{selected === "multiple" && (
				<div className="wwc:flex wwc:flex-col wwc:gap-2">
					<Label>Max Attendees</Label>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Button
							type="button"
							variant="outline"
							icon
							onClick={() => setMaxAttendees((n) => Math.max(1, n - 1))}
							aria-label="Decrease"
						>
							<Minus className="wwc:h-4 wwc:w-4" />
						</Button>
						<Input
							type="number"
							className="wwc:w-20 wwc:text-center"
							value={maxAttendees}
							onChange={(e) => setMaxAttendees(Number(e.target.value) || 1)}
						/>
						<Button
							type="button"
							variant="outline"
							icon
							onClick={() => setMaxAttendees((n) => n + 1)}
							aria-label="Increase"
						>
							<Plus className="wwc:h-4 wwc:w-4" />
						</Button>
					</div>
				</div>
			)}

			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Checkbox id="show-seats" />
				<Label htmlFor="show-seats" className="wwc:font-normal">
					Show available attendee seats on booking page
				</Label>
			</div>
		</div>
	);
};

export const InsideDialog: Story = {
	render: () => {
		const StepperDialogDemo = () => {
			const [step, setStep] = React.useState(3);

			return (
				<Dialog>
					<DialogTrigger asChild>
						<Button>New Repeating Schedule</Button>
					</DialogTrigger>
					<DialogContent className="wwc:sm:max-w-3xl">
						<DialogHeader>
							<DialogTitle>New Repeating Schedule</DialogTitle>
						</DialogHeader>
						<div className="wwc:flex wwc:gap-8 wwc:py-2">
							<Stepper value={step} orientation="vertical" className="wwc:w-44 wwc:shrink-0">
								<StepperList>
									{STEPS.map(({step: s, label}) => (
										<StepperItem key={s} step={s}>
											<StepperIndicator />
											<StepperLabel>{label}</StepperLabel>
										</StepperItem>
									))}
								</StepperList>
							</Stepper>
							<div className="wwc:flex-1">
								<AttendeesPanel />
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">Cancel</Button>
							</DialogClose>
							<Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
								Previous
							</Button>
							<Button onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))} disabled={step === STEPS.length}>
								Next
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			);
		};

		return <StepperDialogDemo />;
	},
};

export const InsidePage: Story = {
	render: () => {
		const StepperPageDemo = () => {
			const [step, setStep] = React.useState(3);

			return (
				<div className="wwc:rounded-lg wwc:border wwc:bg-card wwc:p-6 wwc:w-full wwc:max-w-4xl">
					<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-6">New Repeating Schedule</h2>
					<div className="wwc:flex wwc:gap-8">
						<Stepper value={step} orientation="vertical" className="wwc:w-48 wwc:shrink-0">
							<StepperList>
								{STEPS.map(({step: s, label}) => (
									<StepperItem key={s} step={s}>
										<StepperIndicator />
										<StepperLabel>{label}</StepperLabel>
									</StepperItem>
								))}
							</StepperList>
						</Stepper>
						<div className="wwc:flex wwc:flex-1 wwc:flex-col wwc:gap-6">
							<AttendeesPanel />
							<div className="wwc:flex wwc:justify-end wwc:gap-2 wwc:mt-auto">
								<Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
									Previous
								</Button>
								<Button onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))} disabled={step === STEPS.length}>
									Next
								</Button>
							</div>
						</div>
					</div>
				</div>
			);
		};

		return <StepperPageDemo />;
	},
};
