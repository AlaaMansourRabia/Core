/**
 * Avoid excessive columns.
 */
import {MilestoneTable, MilestoneTableRow, MilestoneTableCell} from "@corensystem/coren-ui/milestone-table";

export function DetailDont() {
	return (
		<MilestoneTable>
			<MilestoneTableRow>
				<MilestoneTableCell>Launch</MilestoneTableCell>
				<MilestoneTableCell>Mar 15</MilestoneTableCell>
				<MilestoneTableCell>John</MilestoneTableCell>
				<MilestoneTableCell>Engineering</MilestoneTableCell>
				<MilestoneTableCell>High</MilestoneTableCell>
				<MilestoneTableCell>v2.0</MilestoneTableCell>
				<MilestoneTableCell>Approved</MilestoneTableCell>
			</MilestoneTableRow>
		</MilestoneTable>
	);
}
