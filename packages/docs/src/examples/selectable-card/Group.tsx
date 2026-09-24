/**
 * Multiple selectable cards in a group.
 */
import {SelectableCard, SelectableCardGroup} from "@corensystem/coren-ui/selectable-card";
import * as React from "react";

export function Group() {
	const [value, setValue] = React.useState<string[]>([]);
	return (
		<SelectableCardGroup value={value} onValueChange={setValue} multiple className="wwc:grid-cols-2 wwc:w-[400px]">
			<SelectableCard value="a">
				<div className="wwc:font-medium">Plan A</div>
				<div className="wwc:text-sm wwc:text-muted-foreground">Basic features</div>
			</SelectableCard>
			<SelectableCard value="b">
				<div className="wwc:font-medium">Plan B</div>
				<div className="wwc:text-sm wwc:text-muted-foreground">Pro features</div>
			</SelectableCard>
		</SelectableCardGroup>
	);
}
