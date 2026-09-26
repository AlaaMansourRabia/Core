/**
 * Default milestone table for project tracking.
 */
import {MilestoneTable, MilestoneTableRow, MilestoneTableCell} from "@corensystem/coren-ui/milestone-table";

export function Default() {
	return (
		<MilestoneTable>
			<MilestoneTableRow>
				<MilestoneTableCell>Phase 1</MilestoneTableCell>
				<MilestoneTableCell>Design</MilestoneTableCell>
				<MilestoneTableCell status="complete">Done</MilestoneTableCell>
			</MilestoneTableRow>
			<MilestoneTableRow>
				<MilestoneTableCell>Phase 2</MilestoneTableCell>
				<MilestoneTableCell>Development</MilestoneTableCell>
				<MilestoneTableCell status="in-progress">In Progress</MilestoneTableCell>
			</MilestoneTableRow>
		</MilestoneTable>
	);
}
