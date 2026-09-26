/**
 * Number input with min and max constraints.
 */
import {NumberInput} from "@corensystem/coren-ui/number-input";
import * as React from "react";

export function MinMax() {
	const [value, setValue] = React.useState<number | undefined>(5);
	return (
		<div className="wwc:space-y-2">
			<NumberInput value={value} onChange={setValue} min={0} max={10} className="wwc:w-[150px]" />
			<p className="wwc:text-xs wwc:text-muted-foreground">Min: 0, Max: 10</p>
		</div>
	);
}
