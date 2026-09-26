/**
 * A basic segmented control for selecting options.
 */
import {SegmentedControl} from "@corensystem/coren-ui/segmented-control";
import * as React from "react";

export function Default() {
	const [value, setValue] = React.useState("daily");
	return (
		<SegmentedControl
			value={value}
			onChange={setValue}
			options={[
				{value: "daily", label: "Daily"},
				{value: "weekly", label: "Weekly"},
				{value: "monthly", label: "Monthly"},
			]}
		/>
	);
}
