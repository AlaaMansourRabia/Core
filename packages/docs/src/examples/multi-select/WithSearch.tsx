import {MultiSelect} from "@corensystem/coren-ui/multi-select";
/**
 * Multi-select with search filtering.
 */
import * as React from "react";

const countries = [
	{label: "United States", value: "us"},
	{label: "United Kingdom", value: "uk"},
	{label: "Canada", value: "ca"},
	{label: "Australia", value: "au"},
	{label: "Germany", value: "de"},
	{label: "France", value: "fr"},
	{label: "Japan", value: "jp"},
	{label: "Brazil", value: "br"},
];

export function WithSearch() {
	const [selected, setSelected] = React.useState<string[]>([]);

	return (
		<MultiSelect
			options={countries}
			selected={selected}
			onChange={setSelected}
			placeholder="Search countries..."
			searchable
			className="wwc:w-80"
		/>
	);
}
