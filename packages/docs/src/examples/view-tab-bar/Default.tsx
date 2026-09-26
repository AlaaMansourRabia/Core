/**
 * Default view tab bar.
 */
import {ViewTabBar, ViewTab} from "@corensystem/coren-ui/view-tab-bar";

export function Default() {
	return (
		<ViewTabBar>
			<ViewTab active>Overview</ViewTab>
			<ViewTab>Details</ViewTab>
			<ViewTab>Settings</ViewTab>
		</ViewTabBar>
	);
}
