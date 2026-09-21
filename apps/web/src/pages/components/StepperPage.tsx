import {Minus, Plus, User, Users} from "lucide-react";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {CopyButton} from "@/components/ui/copy-button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
	Stepper,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperLabel,
	StepperList,
} from "@/components/ui/stepper";
import {cn} from "@/lib/utils";

const STEPS = [
	{step: 1, label: "Details"},
	{step: 2, label: "Availability"},
	{step: 3, label: "Attendees"},
	{step: 4, label: "Notifications"},
	{step: 5, label: "More Options"},
];

function AttendeesPanel() {
	const [selected, setSelected] = useState<"one" | "multiple">("multiple");
	const [maxAttendees, setMaxAttendees] = useState(10);

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
}

function StepperDialogDemo() {
	const [step, setStep] = useState(3);
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Open Repeating Schedule</Button>
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
}

function StepperPageDemo() {
	const [step, setStep] = useState(3);
	return (
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
	);
}

export function StepperPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Stepper</h1>
					<CopyButton
						value="Stepper"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Indicates progress through a sequence of steps. Use inside a dialog or directly on a page.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Vertical (default)</CardTitle>
						<CopyButton
							value="Stepper - Vertical"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Stepper value={3} orientation="vertical" className="wwc:w-56">
						<StepperList>
							{STEPS.map(({step, label}) => (
								<StepperItem key={step} step={step}>
									<StepperIndicator />
									<StepperLabel>{label}</StepperLabel>
								</StepperItem>
							))}
						</StepperList>
					</Stepper>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Horizontal</CardTitle>
						<CopyButton
							value="Stepper - Horizontal"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Stepper value={3} orientation="horizontal" className="wwc:w-full">
						<StepperList>
							{STEPS.map(({step, label}) => (
								<StepperItem key={step} step={step} className="wwc:flex-1">
									<StepperIndicator />
									<StepperLabel>{label}</StepperLabel>
								</StepperItem>
							))}
						</StepperList>
					</Stepper>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Description</CardTitle>
						<CopyButton
							value="Stepper - With Description"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Stepper value={2} orientation="vertical" className="wwc:w-72">
						<StepperList>
							{[
								{step: 1, label: "Details", description: "Title, dates, location"},
								{step: 2, label: "Availability", description: "When you're free"},
								{step: 3, label: "Attendees", description: "Who can book"},
								{step: 4, label: "Notifications", description: "Reminders & alerts"},
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Inside a Page</CardTitle>
						<CopyButton
							value="Stepper - Inside a Page"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Wizard layout with stepper alongside form content.</CardDescription>
				</CardHeader>
				<CardContent>
					<StepperPageDemo />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Inside a Dialog</CardTitle>
						<CopyButton
							value="Stepper - Inside a Dialog"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Multi-step form inside a modal.</CardDescription>
				</CardHeader>
				<CardContent>
					<StepperDialogDemo />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Stepper - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "value",
										type: "number",
										def: "—",
										desc: "1-indexed current step. Steps below this number render as completed; this step as current; above as upcoming.",
									},
									{
										prop: "orientation",
										type: '"vertical" | "horizontal"',
										def: '"vertical"',
										desc: "Layout direction of the steps.",
									},
									{
										prop: "step (on StepperItem)",
										type: "number",
										def: "—",
										desc: "1-indexed step number. State is derived from this and the root's value.",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
