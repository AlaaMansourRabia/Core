/**
 * Browser tabs with overflow menu.
 */
import {BrowserTabs, BrowserTab, BrowserTabsOverflow} from "@corensystem/coren-ui/browser-tabs";

export function Overflow() {
	return (
		<BrowserTabs>
			<BrowserTab active>Tab 1</BrowserTab>
			<BrowserTab>Tab 2</BrowserTab>
			<BrowserTab>Tab 3</BrowserTab>
			<BrowserTabsOverflow count={5} />
		</BrowserTabs>
	);
}
