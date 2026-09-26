/**
 * Avoid unclear or missing change indicators.
 */
import {BrowserTabs, BrowserTab} from "@corensystem/coren-ui/browser-tabs";

export function IndicatorDont() {
	return (
		<BrowserTabs>
			<BrowserTab active>document.txt *</BrowserTab>
			<BrowserTab>saved.txt</BrowserTab>
		</BrowserTabs>
	);
}
