import {useState} from "react";

import {type BlueprintViewer3WalkthroughFloor, BlueprintViewer3} from "@/components/ui/blueprint-viewer-3";
import {CopyButton} from "@/components/ui/copy-button";
import {WalkthroughModal} from "@/components/ui/walkthrough-modal";

export function BlueprintViewer3Page() {
	// The walk-through button on each blueprint segment opens the walkthrough modal for that floor.
	const [walkFloor, setWalkFloor] = useState<BlueprintViewer3WalkthroughFloor | null>(null);

	return (
		<div className="wwc:space-y-6">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Blueprint Viewer #3</h1>
					<CopyButton
						value="Blueprint Viewer #3"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					A working duplicate of the Blueprint Viewer for iterating on a v3 design. This copy is self-contained in the
					web app — adjust it here without touching the published component.
				</p>
			</div>

			<div className="wwc:h-[720px] wwc:overflow-hidden wwc:rounded-lg wwc:border">
				<BlueprintViewer3 onWalkthrough={setWalkFloor} />
			</div>

			{/* The per-blueprint walk-through button opens the walkthrough modal for that floor. */}
			<WalkthroughModal
				open={walkFloor != null}
				onOpenChange={(open) => !open && setWalkFloor(null)}
				title={walkFloor ? `Walk-through · ${walkFloor.name} · ${walkFloor.value}%` : "Walk-through"}
			/>
		</div>
	);
}
