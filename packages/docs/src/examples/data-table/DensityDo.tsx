/**
 * Use appropriate density for data complexity.
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
	{id: 1, name: "Alice Johnson", role: "Admin"},
	{id: 2, name: "Bob Smith", role: "User"},
	{id: 3, name: "Carol White", role: "Editor"},
];

export function DensityDo() {
	return (
		<DataTable density="comfortable">
			<DataTableHeader>
				<DataTableRow>
					<DataTableHead>Name</DataTableHead>
					<DataTableHead>Role</DataTableHead>
				</DataTableRow>
			</DataTableHeader>
			<DataTableBody>
				{data.map((row) => (
					<DataTableRow key={row.id}>
						<DataTableCell>{row.name}</DataTableCell>
						<DataTableCell>{row.role}</DataTableCell>
					</DataTableRow>
				))}
			</DataTableBody>
		</DataTable>
	);
}
