/**
 * Avoid too many tabs.
 */
import {TabList} from "@corensystem/coren-ui/tab-list";

export function CountDont() {
	return (
		<TabList
			items={[
				{value: "1", label: "One"},
				{value: "2", label: "Two"},
				{value: "3", label: "Three"},
				{value: "4", label: "Four"},
				{value: "5", label: "Five"},
				{value: "6", label: "Six"},
				{value: "7", label: "Seven"},
				{value: "8", label: "Eight"},
			]}
			defaultValue="1"
		/>
	);
}
