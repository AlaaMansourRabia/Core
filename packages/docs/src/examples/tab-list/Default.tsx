/**
 * A basic tab list with default styling.
 */
import {TabList} from "@corensystem/coren-ui/tab-list";

export function Default() {
	return (
		<TabList
			items={[
				{value: "account", label: "Account"},
				{value: "password", label: "Password"},
				{value: "settings", label: "Settings"},
			]}
			defaultValue="account"
		/>
	);
}
