/**
 * Toolbar pager with page info.
 */
import {ToolbarPager} from "@corensystem/coren-ui/toolbar-pager";

export function WithInfo() {
	return <ToolbarPager current={2} total={8} showInfo />;
}
