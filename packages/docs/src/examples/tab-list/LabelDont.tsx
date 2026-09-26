/**
 * Avoid overly long tab labels.
 */
import {TabList} from "@corensystem/coren-ui/tab-list";

export function LabelDont() {
	return (
		<TabList
			items={[
				{value: "general", label: "General Account Settings"},
				{value: "security", label: "Security and Privacy Options"},
				{value: "billing", label: "Billing and Payment Information"},
			]}
			defaultValue="general"
		/>
	);
}
