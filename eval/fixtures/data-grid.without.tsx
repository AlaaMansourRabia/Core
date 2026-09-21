import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@wakecap/core-ui/table";

export function WorkersTable({data}) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Role</TableHead>
					<TableHead>Site</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((w) => (
					<TableRow key={w.id}>
						<TableCell>{w.name}</TableCell>
						<TableCell>{w.role}</TableCell>
						<TableCell>{w.site}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
