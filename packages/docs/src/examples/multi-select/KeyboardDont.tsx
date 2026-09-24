/**
 * Avoid mouse-only selection interfaces.
 */
import * as React from "react";
import {Checkbox} from "@corensystem/coren-ui/checkbox";

export function KeyboardDont() {
	return (
		<div className="wwc:w-80 wwc:rounded-md wwc:border wwc:p-2 wwc:space-y-2">
			{/* Click-only interface without keyboard nav */}
			{["Apple", "Banana", "Cherry"].map((item) => (
				<div
					key={item}
					className="wwc:flex wwc:items-center wwc:gap-2 wwc:cursor-pointer wwc:p-1 wwc:rounded wwc:hover:bg-accent"
					onClick={() => {}}
				>
					<Checkbox />
					<span className="wwc:text-sm">{item}</span>
				</div>
			))}
		</div>
	);
}
