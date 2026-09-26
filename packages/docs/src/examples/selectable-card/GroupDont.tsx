/**
 * Avoid manually managing selection for multiple cards.
 */
import {SelectableCard} from "@corensystem/coren-ui/selectable-card";
import * as React from "react";

export function GroupDont() {
	const [a, setA] = React.useState(false);
	const [b, setB] = React.useState(false);
	return (
		<div className="wwc:flex wwc:gap-4">
			<SelectableCard selected={a} onSelect={setA}>A</SelectableCard>
			<SelectableCard selected={b} onSelect={setB}>B</SelectableCard>
		</div>
	);
}
