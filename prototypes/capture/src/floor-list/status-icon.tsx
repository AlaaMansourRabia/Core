import {cn} from "@corensystem/core-utils";
import {Check, CircleDashed, Clock} from "lucide-react";

import type {FloorStatus} from "./types";

/** 16px lucide glyph whose icon + color reflect a floor's construction status. */
export function StatusIcon({status, className}: {status: FloorStatus; className?: string}) {
	switch (status) {
		case "in-progress":
			return <CircleDashed className={cn("wwc:size-4 wwc:shrink-0", "wwc:text-[#2563eb]", className)} />;
		case "complete":
			return <Check className={cn("wwc:size-4 wwc:shrink-0", "wwc:text-[#2acb37]", className)} />;
		case "not-started":
		default:
			return <Clock className={cn("wwc:size-4 wwc:shrink-0", "wwc:text-[#9ca3af]", className)} />;
	}
}
