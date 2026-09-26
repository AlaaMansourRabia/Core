/**
 * Multi-select with default selections.
 */
import * as React from "react";
import {MultiSelect} from "@corensystem/coren-ui/multi-select";

const skills = [
	{label: "JavaScript", value: "js"},
	{label: "TypeScript", value: "ts"},
	{label: "Python", value: "python"},
	{label: "Go", value: "go"},
	{label: "Rust", value: "rust"},
];

export function WithDefault() {
	const [selected, setSelected] = React.useState<string[]>(["js", "ts"]);

	return (
		<MultiSelect
			options={skills}
			selected={selected}
			onChange={setSelected}
			placeholder="Select skills..."
			className="wwc:w-80"
		/>
	);
}
