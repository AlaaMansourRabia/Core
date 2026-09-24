/**
 * Browser tabs with favicon icons.
 */
import {BrowserTabs, BrowserTab, BrowserTabIcon} from "@corensystem/coren-ui/browser-tabs";
import {Globe, FileText, Settings} from "lucide-react";

export function WithIcons() {
	return (
		<BrowserTabs>
			<BrowserTab active>
				<BrowserTabIcon><Globe className="wwc:h-4 wwc:w-4" /></BrowserTabIcon>
				Home
			</BrowserTab>
			<BrowserTab>
				<BrowserTabIcon><FileText className="wwc:h-4 wwc:w-4" /></BrowserTabIcon>
				Docs
			</BrowserTab>
			<BrowserTab>
				<BrowserTabIcon><Settings className="wwc:h-4 wwc:w-4" /></BrowserTabIcon>
				Settings
			</BrowserTab>
		</BrowserTabs>
	);
}
