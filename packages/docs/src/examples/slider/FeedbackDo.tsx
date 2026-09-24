/**
 * Show current value for user feedback.
 */
import {Slider} from "@corensystem/coren-ui/slider";
import {Label} from "@corensystem/coren-ui/label";
import * as React from "react";

export function FeedbackDo() {
	const [value, setValue] = React.useState([30]);

	return (
		<div className="wwc:space-y-2 wwc:w-[200px]">
			<div className="wwc:flex wwc:justify-between">
				<Label>Brightness</Label>
				<span className="wwc:text-sm wwc:font-medium">{value[0]}%</span>
			</div>
			<Slider value={value} onValueChange={setValue} max={100} />
		</div>
	);
}
