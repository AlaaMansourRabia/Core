/**
 * Range slider with two handles.
 */
import {Slider} from "@corensystem/coren-ui/slider";
import {Label} from "@corensystem/coren-ui/label";
import * as React from "react";

export function Range() {
	const [value, setValue] = React.useState([25, 75]);

	return (
		<div className="wwc:space-y-2 wwc:w-[200px]">
			<div className="wwc:flex wwc:justify-between">
				<Label>Price range</Label>
				<span className="wwc:text-sm wwc:text-muted-foreground">${value[0]} - ${value[1]}</span>
			</div>
			<Slider value={value} onValueChange={setValue} max={100} step={5} />
		</div>
	);
}
