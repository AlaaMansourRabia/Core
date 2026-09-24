/**
 * Tab list variants: default, underline, and pills.
 */
import {TabList} from "@corensystem/coren-ui/tab-list";

export function Variants() {
	const items = [
		{value: "one", label: "Tab One"},
		{value: "two", label: "Tab Two"},
		{value: "three", label: "Tab Three"},
	];
	return (
		<div className="wwc:space-y-4">
			<TabList items={items} defaultValue="one" variant="default" />
			<TabList items={items} defaultValue="one" variant="underline" />
			<TabList items={items} defaultValue="one" variant="pills" />
		</div>
	);
}
