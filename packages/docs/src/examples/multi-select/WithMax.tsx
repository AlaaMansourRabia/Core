import {MultiSelect} from "@corensystem/coren-ui/multi-select";
/**
 * Multi-select with maximum selection limit.
 */
import * as React from "react";

const tags = [
	{label: "Design", value: "design"},
	{label: "Development", value: "dev"},
	{label: "Marketing", value: "marketing"},
	{label: "Sales", value: "sales"},
	{label: "Support", value: "support"},
];

export function WithMax() {
	const [selected, setSelected] = React.useState<string[]>([]);

	return (
		<div className="wwc:space-y-2">
			<MultiSelect
				options={tags}
				selected={selected}
				onChange={setSelected}
				placeholder="Select up to 3 tags..."
				maxSelected={3}
				className="wwc:w-80"
			/>
			<p className="wwc:text-xs wwc:text-muted-foreground">{selected.length}/3 selected</p>
		</div>
	);
}
