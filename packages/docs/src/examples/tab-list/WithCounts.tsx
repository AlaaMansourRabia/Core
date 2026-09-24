/**
 * Tab items with count badges.
 */
import {TabList} from "@corensystem/coren-ui/tab-list";

export function WithCounts() {
	return (
		<TabList
			items={[
				{value: "all", label: "All", count: 42},
				{value: "active", label: "Active", count: 12},
				{value: "archived", label: "Archived", count: 30},
			]}
			defaultValue="all"
		/>
	);
}
