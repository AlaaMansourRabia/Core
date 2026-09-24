/**
 * Use SelectableCardGroup for managed selection state.
 */
import {SelectableCard, SelectableCardGroup} from "@corensystem/coren-ui/selectable-card";
import * as React from "react";

export function GroupDo() {
	const [value, setValue] = React.useState<string[]>([]);
	return (
		<SelectableCardGroup value={value} onValueChange={setValue} className="wwc:grid-cols-2 wwc:w-[300px]">
			<SelectableCard value="a">Option A</SelectableCard>
			<SelectableCard value="b">Option B</SelectableCard>
		</SelectableCardGroup>
	);
}
