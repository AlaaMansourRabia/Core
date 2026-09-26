/**
 * Segmented control with form name attribute.
 */
import {SegmentedControl} from "@corensystem/coren-ui/segmented-control";
import * as React from "react";

export function InForm() {
	const [value, setValue] = React.useState("light");
	return (
		<div className="wwc:space-y-2">
			<label className="wwc:text-sm wwc:font-medium">Theme</label>
			<SegmentedControl
				name="theme"
				value={value}
				onChange={setValue}
				options={[
					{value: "light", label: "Light"},
					{value: "dark", label: "Dark"},
					{value: "system", label: "System"},
				]}
			/>
		</div>
	);
}
