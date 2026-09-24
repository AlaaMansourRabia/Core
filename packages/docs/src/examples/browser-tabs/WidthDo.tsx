/**
 * Use consistent tab widths.
 */
import {BrowserTabs, BrowserTab} from "@corensystem/coren-ui/browser-tabs";

export function WidthDo() {
	return (
		<BrowserTabs>
			<BrowserTab active>Home</BrowserTab>
			<BrowserTab>About</BrowserTab>
			<BrowserTab>Contact</BrowserTab>
		</BrowserTabs>
	);
}
