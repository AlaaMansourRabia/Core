/**
 * Show relevant milestone details.
 */
import {MilestoneTable, MilestoneTableRow, MilestoneTableCell} from "@corensystem/coren-ui/milestone-table";

export function DetailDo() {
	return (
		<MilestoneTable>
			<MilestoneTableRow>
				<MilestoneTableCell>Launch</MilestoneTableCell>
				<MilestoneTableCell>Mar 15</MilestoneTableCell>
				<MilestoneTableCell>John</MilestoneTableCell>
			</MilestoneTableRow>
		</MilestoneTable>
	);
}
