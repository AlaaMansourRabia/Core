import {Checkbox} from "@corensystem/coren-ui/checkbox";
/**
 * Data table with row selection.
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
	{id: 1, name: "Document.pdf", size: "2.4 MB", modified: "Jan 15, 2024"},
	{id: 2, name: "Image.png", size: "1.2 MB", modified: "Jan 12, 2024"},
	{id: 3, name: "Report.xlsx", size: "890 KB", modified: "Jan 18, 2024"},
];

export function WithSelection() {
	return (
		<DataTable>
			<DataTableHeader>
				<DataTableRow>
					<DataTableHead className="wwc:w-12">
						<Checkbox aria-label="Select all" />
					</DataTableHead>
					<DataTableHead>Name</DataTableHead>
					<DataTableHead>Size</DataTableHead>
					<DataTableHead>Modified</DataTableHead>
				</DataTableRow>
			</DataTableHeader>
			<DataTableBody>
				{data.map((row) => (
					<DataTableRow key={row.id}>
						<DataTableCell>
							<Checkbox aria-label={`Select ${row.name}`} />
						</DataTableCell>
						<DataTableCell>{row.name}</DataTableCell>
						<DataTableCell>{row.size}</DataTableCell>
						<DataTableCell>{row.modified}</DataTableCell>
					</DataTableRow>
				))}
			</DataTableBody>
		</DataTable>
	);
}
