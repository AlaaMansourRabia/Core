import {Maximize2} from "lucide-react";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {FullscreenExitButton} from "@/components/ui/fullscreen-exit-button";

export function FixedContent1Page() {
	const [fullscreen, setFullscreen] = useState(false);

	return (
		<div
			className={fullscreen ? "wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-background wwc:overflow-y-auto" : "wwc:space-y-8"}
		>
			{!fullscreen && (
				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<div>
						<h1 className="wwc:text-3xl wwc:font-bold">Fixed Content #1</h1>
						<p className="wwc:text-muted-foreground wwc:mt-2">Two fixed panels side by side.</p>
					</div>
					<Button variant="outline" size="sm" onClick={() => setFullscreen(true)}>
						<Maximize2 /> Fullscreen
					</Button>
				</div>
			)}

			<div
				className={`wwc:overflow-hidden wwc:flex ${fullscreen ? "wwc:h-screen" : "wwc:border wwc:rounded-xl wwc:h-[600px]"}`}
			>
				<div className="wwc:w-1/2 wwc:border-r wwc:p-4 wwc:bg-background">
					<h3 className="wwc:text-sm wwc:font-semibold wwc:mb-3">Panel A</h3>
					<p className="wwc:text-sm wwc:text-muted-foreground">Left content area.</p>
				</div>
				<div className="wwc:w-1/2 wwc:p-4 wwc:bg-background">
					<h3 className="wwc:text-sm wwc:font-semibold wwc:mb-3">Panel B</h3>
					<p className="wwc:text-sm wwc:text-muted-foreground">Right content area.</p>
				</div>
			</div>
			{fullscreen && <FullscreenExitButton onExit={() => setFullscreen(false)} />}
		</div>
	);
}
