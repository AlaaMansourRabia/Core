/**
 * Data table with sortable columns.
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
	{id: 1, name: "Alice Johnson", sales: 12500, date: "2024-01-15"},
	{id: 2, name: "Bob Smith", sales: 8900, date: "2024-01-12"},
	{id: 3, name: "Carol White", sales: 15200, date: "2024-01-18"},
];

export function WithSorting() {
	return (
		<DataTable>
			<DataTableHeader>
				<DataTableRow>
					<DataTableHead sortable>Name</DataTableHead>
					<DataTableHead sortable sortDirection="desc">
						Sales
					</DataTableHead>
					<DataTableHead sortable>Date</DataTableHead>
				</DataTableRow>
			</DataTableHeader>
			<DataTableBody>
				{data.map((row) => (
					<DataTableRow key={row.id}>
						<DataTableCell>{row.name}</DataTableCell>
						<DataTableCell>${row.sales.toLocaleString()}</DataTableCell>
						<DataTableCell>{row.date}</DataTableCell>
					</DataTableRow>
				))}
			</DataTableBody>
		</DataTable>
	);
}
