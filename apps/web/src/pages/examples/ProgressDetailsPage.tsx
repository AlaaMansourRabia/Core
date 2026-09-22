import {Maximize2} from "lucide-react";
import {useEffect, useState} from "react";

import {Button} from "@/components/ui/button";
import {CopyButton} from "@/components/ui/copy-button";
import {FullscreenExitButton} from "@/components/ui/fullscreen-exit-button";
import {ProgressDetails} from "@/components/ui/progress-details";

export function ProgressDetailsPage() {
	// Fullscreen is owned HERE, by the spec/host page — NOT by ProgressDetails. The component
	// deliberately has no fullscreen button; this page provides the trigger (below the title) and the exit
	// affordance (FullscreenExitButton). Esc also exits. This keeps the component free of host-only chrome.
	const [fullScreen, setFullScreen] = useState(false);

	useEffect(() => {
		if (!fullScreen) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setFullScreen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [fullScreen]);

	if (fullScreen) {
		return (
			<div className="wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-background">
				<ProgressDetails />
				{/* Exit control lives on the host page, not inside the component. */}
				<FullscreenExitButton onExit={() => setFullScreen(false)} />
			</div>
		);
	}

	return (
		<div className="wwc:space-y-6">
			<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4">
				<div>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<h1 className="wwc:text-3xl wwc:font-bold">Progress Details</h1>
						<CopyButton
							value="Progress Details"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
						A progress-details workspace: a three-bar header (app navigation, period context, search &amp; filter), a
						WBS Navigator, and a content list that drills the hierarchy — zone → category → division → task → object.
						Every row is the shared <code className="wwc:text-xs">ProgressListItem</code> component (generic / task /
						object variants), built on Core primitives (Badge, Progress, icons); an object opens the Operations Drawer
						to review its operations.
					</p>
				</div>
				{/* This fullscreen trigger is host-page chrome — the component itself has no such button. */}
				<Button type="button" variant="outline" className="wwc:shrink-0" onClick={() => setFullScreen(true)}>
					<Maximize2 className="wwc:size-4" />
					Full screen
				</Button>
			</div>

			<div className="wwc:h-[720px] wwc:overflow-hidden wwc:rounded-lg wwc:border">
				<ProgressDetails />
			</div>
		</div>
	);
}
