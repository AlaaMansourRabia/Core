/**
 * Single selection card group.
 */
import {SelectableCard, SelectableCardGroup} from "@corensystem/coren-ui/selectable-card";
import * as React from "react";

export function SingleSelect() {
	const [value, setValue] = React.useState<string[]>(["monthly"]);
	return (
		<SelectableCardGroup value={value} onValueChange={setValue} className="wwc:grid-cols-3 wwc:w-[450px]">
			<SelectableCard value="monthly">
				<div className="wwc:font-medium">Monthly</div>
			</SelectableCard>
			<SelectableCard value="yearly">
				<div className="wwc:font-medium">Yearly</div>
			</SelectableCard>
			<SelectableCard value="lifetime">
				<div className="wwc:font-medium">Lifetime</div>
			</SelectableCard>
		</SelectableCardGroup>
	);
}
