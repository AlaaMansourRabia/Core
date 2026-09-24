/**
 * Use clear, descriptive column headers.
 */
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@corensystem/coren-ui/table";

export function HeadersDo() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Customer Name</TableHead>
					<TableHead>Order Date</TableHead>
					<TableHead className="wwc:text-right">Total Amount</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>John Doe</TableCell>
					<TableCell>Jan 15, 2024</TableCell>
					<TableCell className="wwc:text-right">$250.00</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
