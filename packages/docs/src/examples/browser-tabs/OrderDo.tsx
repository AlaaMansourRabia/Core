/**
 * Allow tab reordering via drag and drop.
 */
import {BrowserTabs, BrowserTab} from "@corensystem/coren-ui/browser-tabs";

export function OrderDo() {
	return (
		<BrowserTabs draggable>
			<BrowserTab active>Tab 1</BrowserTab>
			<BrowserTab>Tab 2</BrowserTab>
			<BrowserTab>Tab 3</BrowserTab>
		</BrowserTabs>
	);
}
