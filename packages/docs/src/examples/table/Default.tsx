/**
 * Basic data table with header and rows.
 */
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@corensystem/coren-ui/table";

export function Default() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Role</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>Alice Johnson</TableCell>
					<TableCell>Active</TableCell>
					<TableCell>Admin</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Bob Smith</TableCell>
					<TableCell>Active</TableCell>
					<TableCell>Editor</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Carol Davis</TableCell>
					<TableCell>Inactive</TableCell>
					<TableCell>Viewer</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
