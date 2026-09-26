/**
 * Limit tabs to 2-6 items for usability.
 */
import {TabList} from "@corensystem/coren-ui/tab-list";

export function CountDo() {
	return (
		<TabList
			items={[
				{value: "inbox", label: "Inbox"},
				{value: "sent", label: "Sent"},
				{value: "drafts", label: "Drafts"},
			]}
			defaultValue="inbox"
		/>
	);
}
