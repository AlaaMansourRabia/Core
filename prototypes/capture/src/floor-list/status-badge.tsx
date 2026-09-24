import {cn} from "@corensystem/coren-utils";
import type {FloorStatus} from "./types";

// Small pill/chip that labels a construction floor's status with Figma-derived colors.
const STATUS_MAP: Record<FloorStatus, {label: string; classes: string}> = {
	"in-progress": {
		label: "In Progress",
		classes: "wwc:bg-[#eff6ff] wwc:text-[#2563eb]",
	},
	complete: {
		label: "Complete",
		classes: "wwc:bg-[#dcfce7] wwc:text-[#166534]",
	},
	"not-started": {
		label: "Not started",
		classes: "wwc:bg-[#f9fafb] wwc:text-[#6b7280]",
	},
};

export function StatusBadge({status, className}: {status: FloorStatus; className?: string}) {
	const {label, classes} = STATUS_MAP[status];

	return (
		<span
			className={cn(
				"wwc:inline-flex wwc:shrink-0 wwc:items-center wwc:gap-0.5 wwc:rounded wwc:border wwc:border-transparent wwc:px-1 wwc:py-px wwc:text-[12px] wwc:font-normal wwc:leading-normal",
				classes,
				className,
			)}
		>
			{label}
		</span>
	);
}
