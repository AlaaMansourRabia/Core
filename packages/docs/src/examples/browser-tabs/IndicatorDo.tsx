/**
 * Use indicators for unsaved changes.
 */
import {BrowserTabs, BrowserTab, BrowserTabIndicator} from "@corensystem/coren-ui/browser-tabs";

export function IndicatorDo() {
	return (
		<BrowserTabs>
			<BrowserTab active>
				document.txt
				<BrowserTabIndicator />
			</BrowserTab>
			<BrowserTab>saved.txt</BrowserTab>
		</BrowserTabs>
	);
}
