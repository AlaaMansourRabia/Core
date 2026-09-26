import {Label} from "@corensystem/coren-ui/label";
/**
 * Use appropriate step size for the value range.
 */
import {Slider} from "@corensystem/coren-ui/slider";
import * as React from "react";

export function StepDo() {
	const [value, setValue] = React.useState([50]);

	return (
		<div className="wwc:space-y-2 wwc:w-[200px]">
			<div className="wwc:flex wwc:justify-between">
				<Label>Quantity</Label>
				<span className="wwc:text-sm">{value[0]} items</span>
			</div>
			<Slider value={value} onValueChange={setValue} max={100} step={10} />
		</div>
	);
}
