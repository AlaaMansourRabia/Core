// A1 — illustrative fair-baseline (hand-authored, NOT model-captured).
// Package-only knowledge: the agent reaches for a centered Dialog (the obvious modal) to edit
// filters — it blocks the page. Core guidance (A4) would choose a Sheet instead.
import {Button} from "@corensystem/core-ui/button";
import {Input} from "@corensystem/core-ui/input";
import {Label} from "@corensystem/core-ui/label";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@corensystem/core-ui/dialog";

export default function EditFiltersPanel() {
	return (
		<div className="app:p-4">
			<p className="app:mb-4 app:text-sm app:text-gray-600">Worker list (main content)…</p>
			<Dialog>
				<DialogTrigger asChild>
					<Button>Edit filters</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Filters</DialogTitle>
					</DialogHeader>
					<div className="app:flex app:flex-col app:gap-3 app:py-2">
						<div className="app:flex app:flex-col app:gap-1">
							<Label>Name</Label>
							<Input placeholder="Search name" />
						</div>
						<div className="app:flex app:flex-col app:gap-1">
							<Label>Site</Label>
							<Input placeholder="Site" />
						</div>
					</div>
					<DialogFooter>
						<Button>Apply</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
