/**
 * Avoid hiding important data in later columns.
 */
import {
	DataTable,
	DataTableHeader,
	DataTableBody,
	DataTableRow,
	DataTableHead,
	DataTableCell,
} from "@corensystem/coren-ui/data-table";

const data = [
	{id: 1, internalId: "USR-00001", createdAt: "2024-01-01", name: "Alice"},
];

export function ColumnsDont() {
	return (
		<DataTable>
			<DataTableHeader>
				<DataTableRow>
					<DataTableHead>Internal ID</DataTableHead>
					<DataTableHead>Created At</DataTableHead>
					<DataTableHead>Name</DataTableHead>
				</DataTableRow>
			</DataTableHeader>
			<DataTableBody>
				{data.map((row) => (
					<DataTableRow key={row.id}>
						<DataTableCell>{row.internalId}</DataTableCell>
						<DataTableCell>{row.createdAt}</DataTableCell>
						<DataTableCell>{row.name}</DataTableCell>
					</DataTableRow>
				))}
			</DataTableBody>
		</DataTable>
	);
}
