/**
 * Basic data table with sorting and filtering.
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
	{id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin"},
	{id: 2, name: "Bob Smith", email: "bob@example.com", role: "User"},
	{id: 3, name: "Carol White", email: "carol@example.com", role: "Editor"},
];

export function Default() {
	return (
		<DataTable>
			<DataTableHeader>
				<DataTableRow>
					<DataTableHead>Name</DataTableHead>
					<DataTableHead>Email</DataTableHead>
					<DataTableHead>Role</DataTableHead>
				</DataTableRow>
			</DataTableHeader>
			<DataTableBody>
				{data.map((row) => (
					<DataTableRow key={row.id}>
						<DataTableCell>{row.name}</DataTableCell>
						<DataTableCell>{row.email}</DataTableCell>
						<DataTableCell>{row.role}</DataTableCell>
					</DataTableRow>
				))}
			</DataTableBody>
		</DataTable>
	);
}
