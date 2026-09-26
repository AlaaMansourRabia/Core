/**
 * Avoid extremely varying tab widths.
 */
import {BrowserTabs, BrowserTab} from "@corensystem/coren-ui/browser-tabs";

export function WidthDont() {
	return (
		<BrowserTabs>
			<BrowserTab active className="wwc:w-48">
				Home
			</BrowserTab>
			<BrowserTab className="wwc:w-16">X</BrowserTab>
			<BrowserTab className="wwc:w-96">Very Long Tab Title That Takes Too Much Space</BrowserTab>
		</BrowserTabs>
	);
}
