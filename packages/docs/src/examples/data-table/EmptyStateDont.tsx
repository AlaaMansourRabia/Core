/**
 * Avoid leaving empty tables without guidance.
 */
import {
	DataTable,
	DataTableHeader,
	DataTableBody,
	DataTableRow,
	DataTableHead,
} from "@corensystem/coren-ui/data-table";

export function EmptyStateDont() {
	return (
		<DataTable>
			<DataTableHeader>
				<DataTableRow>
					<DataTableHead>Name</DataTableHead>
					<DataTableHead>Status</DataTableHead>
				</DataTableRow>
			</DataTableHeader>
			<DataTableBody>
				{/* Empty - no rows, no message */}
			</DataTableBody>
		</DataTable>
	);
}
