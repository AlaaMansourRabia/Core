/**
 * Order milestones chronologically.
 */
import {MilestoneTable, MilestoneTableRow, MilestoneTableCell} from "@corensystem/coren-ui/milestone-table";

export function OrderDo() {
	return (
		<MilestoneTable>
			<MilestoneTableRow>
				<MilestoneTableCell>Phase 1</MilestoneTableCell>
			</MilestoneTableRow>
			<MilestoneTableRow>
				<MilestoneTableCell>Phase 2</MilestoneTableCell>
			</MilestoneTableRow>
			<MilestoneTableRow>
				<MilestoneTableCell>Phase 3</MilestoneTableCell>
			</MilestoneTableRow>
		</MilestoneTable>
	);
}
