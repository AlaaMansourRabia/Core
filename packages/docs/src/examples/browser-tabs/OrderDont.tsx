/**
 * Avoid locked tab order in multi-tab interfaces.
 */
import {BrowserTabs, BrowserTab} from "@corensystem/coren-ui/browser-tabs";

export function OrderDont() {
	return (
		<BrowserTabs>
			<BrowserTab active>Fixed Tab 1</BrowserTab>
			<BrowserTab>Fixed Tab 2</BrowserTab>
			<BrowserTab>Fixed Tab 3</BrowserTab>
		</BrowserTabs>
	);
}
