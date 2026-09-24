/**
 * Avoid cramming too much data into table cells.
 */
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@corensystem/coren-ui/table";

export function DensityDont() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>User</TableHead>
					<TableHead>Details</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>Alice</TableCell>
					<TableCell className="wwc:text-xs">
						alice@example.com | Active | Admin | Created: Jan 1, 2024 |
						Last login: Today | 2FA: Enabled | Region: US-West
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
