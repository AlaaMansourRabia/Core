/**
 * Number input with custom step value.
 */
import {NumberInput} from "@corensystem/coren-ui/number-input";
import * as React from "react";

export function Step() {
	const [value, setValue] = React.useState<number | undefined>(0);
	return (
		<div className="wwc:space-y-2">
			<NumberInput value={value} onChange={setValue} step={5} className="wwc:w-[150px]" />
			<p className="wwc:text-xs wwc:text-muted-foreground">Step: 5</p>
		</div>
	);
}
