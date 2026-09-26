import {MultiSelect} from "@corensystem/coren-ui/multi-select";
/**
 * Provide clear way to remove selections.
 */
import * as React from "react";

const options = [
	{label: "Option A", value: "a"},
	{label: "Option B", value: "b"},
	{label: "Option C", value: "c"},
];

export function ClearDo() {
	const [selected, setSelected] = React.useState<string[]>(["a", "b"]);

	return (
		<MultiSelect
			options={options}
			selected={selected}
			onChange={setSelected}
			placeholder="Select options..."
			clearable
			className="wwc:w-80"
		/>
	);
}
