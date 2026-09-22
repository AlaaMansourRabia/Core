// A1 — illustrative fair-baseline (hand-authored, NOT model-captured).
// Package-only knowledge: one long flat form, all fields at once — no steps, no progress,
// no back/next. Core guidance (A4) would compose a Stepper + sectioned steps + validation.
import {Button} from "@corensystem/core-ui/button";
import {Input} from "@corensystem/core-ui/input";
import {Label} from "@corensystem/core-ui/label";

export default function CreateProjectForm() {
	return (
		<form className="app:flex app:flex-col app:gap-4 app:p-4 app:max-w-md">
			<h3 className="app:text-base app:font-semibold">Create project</h3>
			<div className="app:flex app:flex-col app:gap-1">
				<Label>Project name</Label>
				<Input placeholder="e.g. Tower A fit-out" />
			</div>
			<div className="app:flex app:flex-col app:gap-1">
				<Label>Project code</Label>
				<Input placeholder="e.g. TA-2026" />
			</div>
			<div className="app:flex app:flex-col app:gap-1">
				<Label>Team members</Label>
				<Input placeholder="Add emails, comma-separated" />
			</div>
			<div className="app:flex app:flex-col app:gap-1">
				<Label>Manager email</Label>
				<Input placeholder="manager@core.com" />
			</div>
			<Button type="submit">Create project</Button>
			<p className="app:text-xs app:text-gray-500">One flat form — no steps, progress, or per-step validation.</p>
		</form>
	);
}
