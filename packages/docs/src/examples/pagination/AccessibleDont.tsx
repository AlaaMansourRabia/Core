/**
 * Avoid pagination without proper aria labels.
 */
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@corensystem/coren-ui/pagination";

export function AccessibleDont() {
	return (
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious href="#" />
				</PaginationItem>
				<PaginationItem>
					<a href="#" className="wwc:px-3 wwc:py-1">&lt;</a>
				</PaginationItem>
				<PaginationItem>
					<a href="#" className="wwc:px-3 wwc:py-1">&gt;</a>
				</PaginationItem>
				<PaginationItem>
					<PaginationNext href="#" />
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
