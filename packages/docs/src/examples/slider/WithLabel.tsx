/**
 * Slider with label and value display.
 */
import {Slider} from "@corensystem/coren-ui/slider";
import {Label} from "@corensystem/coren-ui/label";
import * as React from "react";

export function WithLabel() {
	const [value, setValue] = React.useState([50]);

	return (
		<div className="wwc:space-y-2 wwc:w-[200px]">
			<div className="wwc:flex wwc:justify-between">
				<Label>Volume</Label>
				<span className="wwc:text-sm wwc:text-muted-foreground">{value[0]}%</span>
			</div>
			<Slider value={value} onValueChange={setValue} max={100} step={1} />
		</div>
	);
}
