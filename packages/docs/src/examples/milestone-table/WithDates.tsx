/**
 * Milestone table with date columns.
 */
import {MilestoneTable, MilestoneTableHeader, MilestoneTableRow, MilestoneTableCell} from "@corensystem/coren-ui/milestone-table";

export function WithDates() {
	return (
		<MilestoneTable>
			<MilestoneTableHeader>
				<MilestoneTableCell>Milestone</MilestoneTableCell>
				<MilestoneTableCell>Start</MilestoneTableCell>
				<MilestoneTableCell>End</MilestoneTableCell>
			</MilestoneTableHeader>
			<MilestoneTableRow>
				<MilestoneTableCell>Kickoff</MilestoneTableCell>
				<MilestoneTableCell>Jan 1</MilestoneTableCell>
				<MilestoneTableCell>Jan 15</MilestoneTableCell>
			</MilestoneTableRow>
		</MilestoneTable>
	);
}
