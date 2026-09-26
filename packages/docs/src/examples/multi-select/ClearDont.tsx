/**
 * Avoid selections that can't be easily removed.
 */
import * as React from "react";
import {Badge} from "@corensystem/coren-ui/badge";

export function ClearDont() {
	const selected = ["Option A", "Option B"];

	return (
		<div className="wwc:w-80 wwc:rounded-md wwc:border wwc:p-2">
			<div className="wwc:flex wwc:flex-wrap wwc:gap-1">
				{/* No clear button or way to remove individual tags */}
				{selected.map((item) => (
					<Badge key={item} variant="secondary">
						{item}
					</Badge>
				))}
			</div>
		</div>
	);
}
