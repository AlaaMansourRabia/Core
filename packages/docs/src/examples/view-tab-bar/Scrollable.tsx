/**
 * Scrollable view tab bar.
 */
import {ViewTabBar, ViewTab} from "@corensystem/coren-ui/view-tab-bar";

export function Scrollable() {
	return (
		<ViewTabBar scrollable>
			<ViewTab active>Tab 1</ViewTab>
			<ViewTab>Tab 2</ViewTab>
			<ViewTab>Tab 3</ViewTab>
			<ViewTab>Tab 4</ViewTab>
			<ViewTab>Tab 5</ViewTab>
		</ViewTabBar>
	);
}
