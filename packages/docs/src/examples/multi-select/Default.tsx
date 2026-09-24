/**
 * Basic multi-select with tag display.
 */
import * as React from "react";
import {MultiSelect} from "@corensystem/coren-ui/multi-select";

const frameworks = [
	{label: "React", value: "react"},
	{label: "Vue", value: "vue"},
	{label: "Angular", value: "angular"},
	{label: "Svelte", value: "svelte"},
	{label: "Next.js", value: "nextjs"},
];

export function Default() {
	const [selected, setSelected] = React.useState<string[]>([]);

	return (
		<MultiSelect
			options={frameworks}
			selected={selected}
			onChange={setSelected}
			placeholder="Select frameworks..."
			className="wwc:w-80"
		/>
	);
}
