import {Button} from "@corensystem/coren-ui/button";
/**
 * Show helpful empty states with clear actions.
 */
import {
	DataTable,
	DataTableHeader,
	DataTableBody,
	DataTableRow,
	DataTableHead,
	DataTableCell,
} from "@corensystem/coren-ui/data-table";

export function EmptyStateDo() {
	return (
		<DataTable>
			<DataTableHeader>
				<DataTableRow>
					<DataTableHead>Name</DataTableHead>
					<DataTableHead>Status</DataTableHead>
				</DataTableRow>
			</DataTableHeader>
			<DataTableBody>
				<DataTableRow>
					<DataTableCell colSpan={2} className="wwc:h-32 wwc:text-center">
						<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
							<p className="wwc:text-muted-foreground">No users found</p>
							<Button size="sm">Add User</Button>
						</div>
					</DataTableCell>
				</DataTableRow>
			</DataTableBody>
		</DataTable>
	);
}
