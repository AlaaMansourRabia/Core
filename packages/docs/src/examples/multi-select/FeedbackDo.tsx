/**
 * Show selection count and feedback.
 */
import * as React from "react";
import {MultiSelect} from "@corensystem/coren-ui/multi-select";

const options = [
	{label: "Item 1", value: "1"},
	{label: "Item 2", value: "2"},
	{label: "Item 3", value: "3"},
	{label: "Item 4", value: "4"},
	{label: "Item 5", value: "5"},
];

export function FeedbackDo() {
	const [selected, setSelected] = React.useState<string[]>(["1", "2", "3"]);

	return (
		<div className="wwc:space-y-2">
			<MultiSelect
				options={options}
				selected={selected}
				onChange={setSelected}
				placeholder="Select items..."
				showCount
				className="wwc:w-80"
			/>
			<p className="wwc:text-xs wwc:text-muted-foreground">
				{selected.length} of {options.length} items selected
			</p>
		</div>
	);
}
