import {cn} from "@wakecap/core-utils";
import {ChevronLeft, ChevronRight, MoreHorizontal} from "lucide-react";
import * as React from "react";

import {type ButtonProps, buttonVariants} from "./button";

/** Page navigation with previous/next buttons and ellipsis for large page sets. */
const Pagination = ({className, ...props}: React.ComponentProps<"nav">) => (
	<nav
		aria-label="pagination"
		className={cn("wwc:mx-auto wwc:flex wwc:w-full wwc:justify-center", className)}
		{...props}
	/>
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
	({className, ...props}, ref) => (
		<ul ref={ref} className={cn("wwc:flex wwc:flex-row wwc:items-center wwc:gap-1", className)} {...props} />
	),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({className, ...props}, ref) => (
	<li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
	isActive?: boolean;
} & Pick<ButtonProps, "size" | "icon"> &
	React.ComponentProps<"a">;

const PaginationLink = ({className, isActive, size, icon = true, ...props}: PaginationLinkProps) => (
	<a
		aria-current={isActive ? "page" : undefined}
		className={cn(
			buttonVariants({
				variant: isActive ? "outline" : "ghost",
				size,
				icon,
			}),
			className,
		)}
		{...props}
	/>
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({className, ...props}: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink
		aria-label="Go to previous page"
		size="default"
		icon={false}
		className={cn("wwc:gap-1 wwc:pl-2.5", className)}
		{...props}
	>
		<ChevronLeft className="wwc:h-4 wwc:w-4" />
		<span>Previous</span>
	</PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({className, ...props}: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink
		aria-label="Go to next page"
		size="default"
		icon={false}
		className={cn("wwc:gap-1 wwc:pr-2.5", className)}
		{...props}
	>
		<span>Next</span>
		<ChevronRight className="wwc:h-4 wwc:w-4" />
	</PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({className, ...props}: React.ComponentProps<"span">) => (
	<span
		aria-hidden
		className={cn("wwc:flex wwc:h-9 wwc:w-9 wwc:items-center wwc:justify-center", className)}
		{...props}
	>
		<MoreHorizontal className="wwc:h-4 wwc:w-4" />
		<span className="wwc:sr-only">More pages</span>
	</span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
};
