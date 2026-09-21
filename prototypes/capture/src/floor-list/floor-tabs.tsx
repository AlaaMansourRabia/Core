import {cn} from "@core/core-utils";
import {Calendar, Folders, Layers} from "lucide-react";

import type {FloorTab} from "./types";

// Frosted-glass segmented tab bar (Figma node 1842:5602): Floor / Schedule / LBS. The container carries
// NO padding, so the active tab sits flush inside it — its corners clipped by the container's radius.
// Each tab has 12px padding; a 4px gap separates them.
export function FloorTabs({
	active,
	onChange,
	className,
}: {
	active: FloorTab;
	onChange: (tab: FloorTab) => void;
	className?: string;
}) {
	const tabs: {id: FloorTab; label: string; Icon: typeof Layers}[] = [
		{id: "floors", label: "Floor", Icon: Layers},
		{id: "schedule", label: "Schedule", Icon: Calendar},
		{id: "lbs", label: "LBS", Icon: Folders},
	];

	return (
		<div
			className={cn(
				"wwc:flex wwc:items-stretch wwc:gap-1 wwc:overflow-hidden wwc:rounded wwc:border wwc:border-[rgba(255,255,255,0.5)] wwc:bg-[rgba(255,255,255,0.8)] wwc:shadow-[0_12px_40px_rgba(0,0,0,0.05)] wwc:backdrop-blur-lg",
				className,
			)}
		>
			{tabs.map((tab) => {
				const isActive = tab.id === active;

				return (
					<button
						key={tab.id}
						type="button"
						aria-pressed={isActive}
						onClick={() => onChange(tab.id)}
						className={cn(
							"wwc:flex wwc:items-center wwc:gap-1 wwc:whitespace-nowrap wwc:p-3 wwc:text-[13px] wwc:transition-colors wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-inset wwc:focus-visible:ring-ring",
							isActive
								? "wwc:bg-[rgba(255,255,255,0.95)] wwc:font-semibold wwc:text-[#111827]"
								: "wwc:font-medium wwc:text-[#6b7280] wwc:hover:bg-[rgba(255,255,255,0.45)] wwc:hover:text-[#111827]",
						)}
					>
						<tab.Icon className="wwc:size-3 wwc:shrink-0" />
						<span>{tab.label}</span>
					</button>
				);
			})}
		</div>
	);
}
