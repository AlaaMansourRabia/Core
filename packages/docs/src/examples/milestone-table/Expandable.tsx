/**
 * Expandable milestone rows with tasks.
 */
import {MilestoneTable, MilestoneTableRow, MilestoneTableCell, MilestoneTableExpandable} from "@corensystem/coren-ui/milestone-table";

export function Expandable() {
	return (
		<MilestoneTable>
			<MilestoneTableExpandable label="Q1 Goals">
				<MilestoneTableRow>
					<MilestoneTableCell>Launch MVP</MilestoneTableCell>
					<MilestoneTableCell status="complete">Done</MilestoneTableCell>
				</MilestoneTableRow>
				<MilestoneTableRow>
					<MilestoneTableCell>User Testing</MilestoneTableCell>
					<MilestoneTableCell status="in-progress">In Progress</MilestoneTableCell>
				</MilestoneTableRow>
			</MilestoneTableExpandable>
		</MilestoneTable>
	);
}
