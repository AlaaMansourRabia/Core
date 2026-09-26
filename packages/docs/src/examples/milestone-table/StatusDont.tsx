/**
 * Avoid unclear status text.
 */
import {MilestoneTable, MilestoneTableRow, MilestoneTableCell} from "@corensystem/coren-ui/milestone-table";

export function StatusDont() {
	return (
		<MilestoneTable>
			<MilestoneTableRow>
				<MilestoneTableCell>Task</MilestoneTableCell>
				<MilestoneTableCell>TBD</MilestoneTableCell>
			</MilestoneTableRow>
		</MilestoneTable>
	);
}
