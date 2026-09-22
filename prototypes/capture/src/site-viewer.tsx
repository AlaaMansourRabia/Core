import {cn} from "@core/core-utils";
import {useEffect, useRef, useState} from "react";

import {villaColorMap} from "./data/villa-progress";
import {SiteModelFrame} from "./site-model-frame";

/** Villa colour options for the site model. */
export type SiteColorMode = "normal" | "progress" | "planned";

const COLOR_MODES: {value: SiteColorMode; label: string}[] = [
	{value: "normal", label: "Normal"},
	{value: "progress", label: "Progress"},
	{value: "planned", label: "Planned"},
];

export interface SiteViewerProps {
	/** Initial villa colour mode. Defaults to `normal` (the model's real materials). */
	defaultColorMode?: SiteColorMode;
	/** Show the built-in bottom-right colour toggle. Defaults to `true`. */
	showColorToggle?: boolean;
	/** Fires with the villa code when a villa is clicked in the model. */
	onSelectVilla?: (code: string) => void;
	className?: string;
}

/**
 * Site Viewer — the ThatOpen site-level model (villas) over the DroneDeploy ortho, with per-villa
 * hover (built into the model) and the construction-progress colours (bundled, offline). The colour
 * options — normal / progress (actual %) / planned (planned %) — swap the villa tint live.
 */
export function SiteViewer({
	defaultColorMode = "normal",
	showColorToggle = true,
	onSelectVilla,
	className,
}: SiteViewerProps) {
	const [colorMode, setColorMode] = useState<SiteColorMode>(defaultColorMode);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const postToSite = (message: Record<string, unknown>) => iframeRef.current?.contentWindow?.postMessage(message, "*");

	// Drive the villa tint from the bundled colour data — no network. The site model queues the
	// message if it arrives before the model has finished loading.
	useEffect(() => {
		if (colorMode === "normal") postToSite({type: "site-progress-clear"});
		else postToSite({type: "site-progress-colors", colors: villaColorMap(colorMode === "planned" ? "planned" : "actual")});
	}, [colorMode]);

	// Villa click bridge (the model posts `ue22-part-click` with the house code).
	useEffect(() => {
		if (!onSelectVilla) return;
		const onMessage = (event: MessageEvent) => {
			const data = event.data as {type?: string; house?: string | null} | null;
			if (data?.type === "ue22-part-click" && data.house) onSelectVilla(data.house);
		};
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, [onSelectVilla]);

	return (
		<div className={cn("wwc:relative wwc:h-full wwc:min-h-0 wwc:w-full wwc:overflow-hidden wwc:bg-background", className)}>
			<SiteModelFrame iframeRef={iframeRef} />

			{showColorToggle && (
				<div className="wwc:absolute wwc:bottom-3 wwc:right-3 wwc:z-40 wwc:inline-flex wwc:items-center wwc:gap-0.5 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background/80 wwc:p-0.5 wwc:shadow-sm wwc:backdrop-blur">
					{COLOR_MODES.map(({value, label}) => (
						<button
							key={value}
							type="button"
							onClick={() => setColorMode(value)}
							aria-pressed={colorMode === value}
							className={cn(
								"wwc:rounded-md wwc:px-3 wwc:py-1.5 wwc:text-[13px] wwc:font-medium wwc:transition-colors",
								colorMode === value
									? "wwc:bg-foreground wwc:text-background"
									: "wwc:text-muted-foreground wwc:hover:text-foreground",
							)}
						>
							{label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
