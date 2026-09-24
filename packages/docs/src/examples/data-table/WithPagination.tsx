/**
 * Data table with pagination controls.
 */
import {
	DataTable,
	DataTableHeader,
	DataTableBody,
	DataTableRow,
	DataTableHead,
	DataTableCell,
} from "@corensystem/coren-ui/data-table";
import {Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext} from "@corensystem/coren-ui/pagination";

const data = [
	{id: 1, product: "Widget A", price: "$29.99", stock: 150},
	{id: 2, product: "Widget B", price: "$49.99", stock: 85},
	{id: 3, product: "Widget C", price: "$19.99", stock: 200},
	{id: 4, product: "Widget D", price: "$99.99", stock: 42},
	{id: 5, product: "Widget E", price: "$14.99", stock: 320},
];

export function WithPagination() {
	return (
		<div className="wwc:space-y-4">
			<DataTable>
				<DataTableHeader>
					<DataTableRow>
						<DataTableHead>Product</DataTableHead>
						<DataTableHead>Price</DataTableHead>
						<DataTableHead>Stock</DataTableHead>
					</DataTableRow>
				</DataTableHeader>
				<DataTableBody>
					{data.map((row) => (
						<DataTableRow key={row.id}>
							<DataTableCell>{row.product}</DataTableCell>
							<DataTableCell>{row.price}</DataTableCell>
							<DataTableCell>{row.stock}</DataTableCell>
						</DataTableRow>
					))}
				</DataTableBody>
			</DataTable>
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious href="#" />
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="#" isActive>1</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="#">2</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="#">3</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationNext href="#" />
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
