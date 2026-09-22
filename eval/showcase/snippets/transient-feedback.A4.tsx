// A4 — CORRECTED example (hand-authored). The captured A4 generation mixed the two toast
// systems: it mounted the Radix <Toaster/> from "@corensystem/core-ui/toaster" but called toast()
// from "@corensystem/core-ui/sonner" — two unconnected stores, so nothing rendered. The correct
// Core pairing is Toaster AND toast both from "@corensystem/core-ui/sonner". (See the original
// captured snippet at eval/results/runs/2026-06-18T11-47-48-077Z/transient-feedback.with.tsx —
// kept as an honest record of the model's wiring mistake.)
import * as React from "react";
import {Button} from "@corensystem/core-ui/button";
import {Toaster, toast} from "@corensystem/core-ui/sonner";

export default function SettingsPage() {
	const handleSave = React.useCallback(() => {
		toast.success("Settings saved", {
			description: "Your changes have been applied.",
			duration: 3000, // auto-dismiss after a few seconds
		});
	}, []);

	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:p-6">
			<h1 className="wwc:text-lg wwc:font-semibold">Settings</h1>
			<Button onClick={handleSave}>Save settings</Button>
			{/* Single Sonner Toaster at the root — this is what renders toast() calls. */}
			<Toaster />
		</div>
	);
}
