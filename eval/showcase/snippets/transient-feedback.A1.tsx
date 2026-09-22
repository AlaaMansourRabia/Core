// A1 — illustrative fair-baseline (hand-authored, NOT model-captured).
// Package-only knowledge: a permanent inline Alert that stays on the page and takes up space.
// Core guidance (A4) would use a transient toast (Sonner) with a root <Toaster/>.
import {useState} from "react";
import {Alert, AlertDescription, AlertTitle} from "@corensystem/core-ui/alert";
import {Button} from "@corensystem/core-ui/button";

export default function SaveSettings() {
	const [saved, setSaved] = useState(false);
	return (
		<div className="app:flex app:flex-col app:gap-4 app:p-4">
			<Button onClick={() => setSaved(true)}>Save settings</Button>
			{saved && (
				<Alert>
					<AlertTitle>Settings saved</AlertTitle>
					<AlertDescription>Your changes have been saved successfully.</AlertDescription>
				</Alert>
			)}
			<p className="app:text-xs app:text-gray-500">
				The alert stays until the component re-renders — it occupies permanent page space.
			</p>
		</div>
	);
}
