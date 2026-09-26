/**
 * Number input with decimal precision.
 */
import {NumberInput} from "@corensystem/coren-ui/number-input";
import * as React from "react";

export function Precision() {
	const [value, setValue] = React.useState<number | undefined>(0);
	return (
		<div className="wwc:space-y-2">
			<NumberInput value={value} onChange={setValue} step={0.1} precision={2} className="wwc:w-[150px]" />
			<p className="wwc:text-xs wwc:text-muted-foreground">2 decimal places</p>
		</div>
	);
}
