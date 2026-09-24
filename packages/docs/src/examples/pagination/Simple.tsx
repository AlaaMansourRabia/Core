/**
 * Simple previous/next pagination.
 */
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@corensystem/coren-ui/pagination";

export function Simple() {
	return (
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious href="#" />
				</PaginationItem>
				<PaginationItem>
					<PaginationNext href="#" />
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
