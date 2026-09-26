/**
 * Table with empty state.
 */
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@corensystem/coren-ui/table";

export function Empty() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Date</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell colSpan={3} className="wwc:text-center wwc:py-8 wwc:text-muted-foreground">
						No results found
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
