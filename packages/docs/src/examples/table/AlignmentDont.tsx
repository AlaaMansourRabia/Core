/**
 * Avoid left-aligning numbers - makes comparison difficult.
 */
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@corensystem/coren-ui/table";

export function AlignmentDont() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Item</TableHead>
					<TableHead>Quantity</TableHead>
					<TableHead>Price</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>Product A</TableCell>
					<TableCell>1,234</TableCell>
					<TableCell>$99.99</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Product B</TableCell>
					<TableCell>56</TableCell>
					<TableCell>$1,299.00</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
