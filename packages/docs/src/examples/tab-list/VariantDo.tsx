/**
 * Use underline variant for page-level navigation.
 */
import {TabList} from "@corensystem/coren-ui/tab-list";

export function VariantDo() {
	return (
		<TabList
			variant="underline"
			items={[
				{value: "overview", label: "Overview"},
				{value: "analytics", label: "Analytics"},
				{value: "reports", label: "Reports"},
			]}
			defaultValue="overview"
		/>
	);
}
