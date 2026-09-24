/**
 * Avoid vague or abbreviated headers.
 */
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@corensystem/coren-ui/table";

export function HeadersDont() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Nm</TableHead>
					<TableHead>Dt</TableHead>
					<TableHead>Amt</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>John Doe</TableCell>
					<TableCell>01/15/24</TableCell>
					<TableCell>250</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
