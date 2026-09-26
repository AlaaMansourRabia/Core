/**
 * Include aria labels for screen readers.
 */
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@corensystem/coren-ui/pagination";

export function AccessibleDo() {
	return (
		<Pagination aria-label="Search results pages">
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious href="#" aria-label="Go to previous page" />
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href="#" aria-label="Page 1">
						1
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href="#" isActive aria-label="Page 2, current page">
						2
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href="#" aria-label="Page 3">
						3
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationNext href="#" aria-label="Go to next page" />
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
