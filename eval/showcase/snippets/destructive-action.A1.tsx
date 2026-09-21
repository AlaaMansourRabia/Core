// A1 — illustrative fair-baseline (hand-authored, NOT model-captured).
// Package-only knowledge: a plain default Button — nothing signals danger. Core guidance
// (A4) would use variant="destructive" (the red, dangerous-action treatment).
import {Button} from "@core/core-ui/button";

export default function DeleteRecord() {
	return (
		<div className="app:flex app:flex-col app:gap-3 app:p-4">
			<p className="app:text-sm app:text-gray-600">Permanently delete the selected record.</p>
			<Button onClick={() => {}}>Delete record</Button>
			<p className="app:text-xs app:text-gray-500">Default variant — no visual cue that this is irreversible.</p>
		</div>
	);
}
