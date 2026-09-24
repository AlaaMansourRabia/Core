/**
 * Avoid cramming too much data into compact rows.
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
	{id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin", dept: "Engineering", phone: "555-0100"},
];

export function DensityDont() {
	return (
		<DataTable density="compact">
			<DataTableHeader>
				<DataTableRow>
					<DataTableHead>Name</DataTableHead>
					<DataTableHead>Email</DataTableHead>
					<DataTableHead>Role</DataTableHead>
					<DataTableHead>Department</DataTableHead>
					<DataTableHead>Phone</DataTableHead>
				</DataTableRow>
			</DataTableHeader>
			<DataTableBody>
				{data.map((row) => (
					<DataTableRow key={row.id}>
						<DataTableCell>{row.name}</DataTableCell>
						<DataTableCell>{row.email}</DataTableCell>
						<DataTableCell>{row.role}</DataTableCell>
						<DataTableCell>{row.dept}</DataTableCell>
						<DataTableCell>{row.phone}</DataTableCell>
					</DataTableRow>
				))}
			</DataTableBody>
		</DataTable>
	);
}
