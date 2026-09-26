/**
 * A selectable card for single selection.
 */
import {SelectableCard} from "@corensystem/coren-ui/selectable-card";
import * as React from "react";

export function Default() {
	const [selected, setSelected] = React.useState(false);
	return (
		<SelectableCard className="wwc:w-[200px]" selected={selected} onSelect={setSelected}>
			<div className="wwc:font-medium">Option A</div>
			<div className="wwc:text-sm wwc:text-muted-foreground">Description text</div>
		</SelectableCard>
	);
}
