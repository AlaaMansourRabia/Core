/**
 * Milestone table with progress bars.
 */
import {MilestoneTable, MilestoneTableRow, MilestoneTableCell, MilestoneTableProgress} from "@corensystem/coren-ui/milestone-table";

export function WithProgress() {
	return (
		<MilestoneTable>
			<MilestoneTableRow>
				<MilestoneTableCell>Sprint 1</MilestoneTableCell>
				<MilestoneTableProgress value={100} />
			</MilestoneTableRow>
			<MilestoneTableRow>
				<MilestoneTableCell>Sprint 2</MilestoneTableCell>
				<MilestoneTableProgress value={65} />
			</MilestoneTableRow>
		</MilestoneTable>
	);
}
