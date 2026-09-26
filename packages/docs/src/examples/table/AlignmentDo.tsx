/**
 * Align numeric values to the right for easy scanning.
 */
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@corensystem/coren-ui/table";

export function AlignmentDo() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Item</TableHead>
					<TableHead className="wwc:text-right">Quantity</TableHead>
					<TableHead className="wwc:text-right">Price</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>Product A</TableCell>
					<TableCell className="wwc:text-right">1,234</TableCell>
					<TableCell className="wwc:text-right">$99.99</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Product B</TableCell>
					<TableCell className="wwc:text-right">56</TableCell>
					<TableCell className="wwc:text-right">$1,299.00</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
