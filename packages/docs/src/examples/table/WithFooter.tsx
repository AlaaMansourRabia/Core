/**
 * Table with footer for totals or summaries.
 */
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@corensystem/coren-ui/table";

export function WithFooter() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Product</TableHead>
					<TableHead className="wwc:text-right">Quantity</TableHead>
					<TableHead className="wwc:text-right">Price</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>Widget A</TableCell>
					<TableCell className="wwc:text-right">10</TableCell>
					<TableCell className="wwc:text-right">$100.00</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Widget B</TableCell>
					<TableCell className="wwc:text-right">5</TableCell>
					<TableCell className="wwc:text-right">$75.00</TableCell>
				</TableRow>
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell colSpan={2}>Total</TableCell>
					<TableCell className="wwc:text-right">$175.00</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	);
}
