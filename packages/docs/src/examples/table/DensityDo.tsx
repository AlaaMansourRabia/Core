/**
 * Use appropriate row density for your data.
 */
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@corensystem/coren-ui/table";

export function DensityDo() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{["Alice", "Bob", "Carol", "David", "Eve"].map((name) => (
					<TableRow key={name}>
						<TableCell>{name}</TableCell>
						<TableCell>{name.toLowerCase()}@example.com</TableCell>
						<TableCell>Active</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
