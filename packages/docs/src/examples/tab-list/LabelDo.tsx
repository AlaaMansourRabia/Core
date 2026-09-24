/**
 * Use concise, descriptive tab labels.
 */
import {TabList} from "@corensystem/coren-ui/tab-list";

export function LabelDo() {
	return (
		<TabList
			items={[
				{value: "general", label: "General"},
				{value: "security", label: "Security"},
				{value: "billing", label: "Billing"},
			]}
			defaultValue="general"
		/>
	);
}
