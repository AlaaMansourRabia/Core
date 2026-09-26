/**
 * Place pagination at the bottom of content.
 */
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@corensystem/coren-ui/pagination";

export function PlacementDo() {
	return (
		<div className="wwc:space-y-4">
			<div className="wwc:h-32 wwc:bg-muted wwc:rounded wwc:flex wwc:items-center wwc:justify-center wwc:text-muted-foreground">
				Results List
			</div>
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious href="#" />
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="#" isActive>
							1
						</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationLink href="#">2</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationNext href="#" />
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
