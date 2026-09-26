/**
 * Toolbar pager with page input.
 */
import {ToolbarPager} from "@corensystem/coren-ui/toolbar-pager";

export function WithInput() {
	return <ToolbarPager current={5} total={20} showInput />;
}
