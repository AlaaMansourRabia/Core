/**
 * View tab bar with count badges.
 */
import {ViewTabBar, ViewTab, ViewTabBadge} from "@corensystem/coren-ui/view-tab-bar";

export function WithBadges() {
	return (
		<ViewTabBar>
			<ViewTab active>
				All<ViewTabBadge>42</ViewTabBadge>
			</ViewTab>
			<ViewTab>
				Active<ViewTabBadge>12</ViewTabBadge>
			</ViewTab>
			<ViewTab>
				Archived<ViewTabBadge>30</ViewTabBadge>
			</ViewTab>
		</ViewTabBar>
	);
}
