/**
 * Table with selectable rows.
 */
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@corensystem/coren-ui/table";
import {Checkbox} from "@corensystem/coren-ui/checkbox";

export function Selectable() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="wwc:w-[50px]">
						<Checkbox id="table-select-all" aria-label="Select all" />
					</TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Email</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>
						<Checkbox id="table-select-1" aria-label="Select row 1" />
					</TableCell>
					<TableCell>Alice</TableCell>
					<TableCell>alice@example.com</TableCell>
				</TableRow>
				<TableRow data-state="selected">
					<TableCell>
						<Checkbox id="table-select-2" defaultChecked aria-label="Select row 2" />
					</TableCell>
					<TableCell>Bob</TableCell>
					<TableCell>bob@example.com</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>
						<Checkbox id="table-select-3" aria-label="Select row 3" />
					</TableCell>
					<TableCell>Carol</TableCell>
					<TableCell>carol@example.com</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
