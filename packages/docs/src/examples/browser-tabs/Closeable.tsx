/**
 * Closeable browser tabs.
 */
import {BrowserTabs, BrowserTab, BrowserTabClose} from "@corensystem/coren-ui/browser-tabs";

export function Closeable() {
	return (
		<BrowserTabs>
			<BrowserTab active>
				Tab 1
				<BrowserTabClose />
			</BrowserTab>
			<BrowserTab>
				Tab 2
				<BrowserTabClose />
			</BrowserTab>
			<BrowserTab>
				Tab 3
				<BrowserTabClose />
			</BrowserTab>
		</BrowserTabs>
	);
}
