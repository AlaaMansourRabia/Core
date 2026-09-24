/**
 * Default browser tabs for multi-page navigation.
 */
import {BrowserTabs, BrowserTab, BrowserTabsNew} from "@corensystem/coren-ui/browser-tabs";

export function Default() {
	return (
		<BrowserTabs>
			<BrowserTab active>Dashboard</BrowserTab>
			<BrowserTab>Settings</BrowserTab>
			<BrowserTab>Reports</BrowserTab>
			<BrowserTabsNew />
		</BrowserTabs>
	);
}
