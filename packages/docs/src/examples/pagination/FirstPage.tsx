/**
 * Pagination on first page with disabled previous.
 */
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@corensystem/coren-ui/pagination";

export function FirstPage() {
	return (
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious href="#" aria-disabled="true" className="wwc:pointer-events-none wwc:opacity-50" />
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href="#" isActive>1</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href="#">2</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href="#">3</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationNext href="#" />
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
