/**
 * Support keyboard navigation and selection.
 */
import * as React from "react";
import {MultiSelect} from "@corensystem/coren-ui/multi-select";

const options = [
	{label: "Apple", value: "apple"},
	{label: "Banana", value: "banana"},
	{label: "Cherry", value: "cherry"},
	{label: "Date", value: "date"},
];

export function KeyboardDo() {
	const [selected, setSelected] = React.useState<string[]>([]);

	return (
		<div className="wwc:space-y-2">
			<MultiSelect
				options={options}
				selected={selected}
				onChange={setSelected}
				placeholder="Select fruits..."
				className="wwc:w-80"
			/>
			<p className="wwc:text-xs wwc:text-muted-foreground">
				↑↓ to navigate, Space to select, Backspace to remove last
			</p>
		</div>
	);
}
