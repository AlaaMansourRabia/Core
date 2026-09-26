/**
 * Use clear status indicators.
 */
import {MilestoneTable, MilestoneTableRow, MilestoneTableCell} from "@corensystem/coren-ui/milestone-table";

export function StatusDo() {
	return (
		<MilestoneTable>
			<MilestoneTableRow>
				<MilestoneTableCell>Task</MilestoneTableCell>
				<MilestoneTableCell status="complete">Complete</MilestoneTableCell>
			</MilestoneTableRow>
		</MilestoneTable>
	);
}
