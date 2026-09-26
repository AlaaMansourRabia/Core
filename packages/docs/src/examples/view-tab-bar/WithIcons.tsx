/**
 * View tab bar with icons.
 */
import {ViewTabBar, ViewTab} from "@corensystem/coren-ui/view-tab-bar";
import {LayoutGrid, List, Table2} from "lucide-react";

export function WithIcons() {
	return (
		<ViewTabBar>
			<ViewTab active>
				<LayoutGrid className="wwc:h-4 wwc:w-4" />
			</ViewTab>
			<ViewTab>
				<List className="wwc:h-4 wwc:w-4" />
			</ViewTab>
			<ViewTab>
				<Table2 className="wwc:h-4 wwc:w-4" />
			</ViewTab>
		</ViewTabBar>
	);
}
