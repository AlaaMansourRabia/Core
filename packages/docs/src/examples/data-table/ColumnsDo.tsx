/**
 * Prioritize important columns first.
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
	{id: 1, name: "Alice", status: "Active", lastLogin: "Today"},
];

export function ColumnsDo() {
	return (
		<DataTable>
			<DataTableHeader>
				<DataTableRow>
					<DataTableHead>Name</DataTableHead>
					<DataTableHead>Status</DataTableHead>
					<DataTableHead>Last Login</DataTableHead>
				</DataTableRow>
			</DataTableHeader>
			<DataTableBody>
				{data.map((row) => (
					<DataTableRow key={row.id}>
						<DataTableCell className="wwc:font-medium">{row.name}</DataTableCell>
						<DataTableCell>{row.status}</DataTableCell>
						<DataTableCell>{row.lastLogin}</DataTableCell>
					</DataTableRow>
				))}
			</DataTableBody>
		</DataTable>
	);
}
