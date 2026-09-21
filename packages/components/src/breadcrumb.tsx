import {Slot} from "@radix-ui/react-slot";
import {cn} from "@core/core-utils";
import {ChevronRight, MoreHorizontal} from "lucide-react";
import * as React from "react";

import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "./dropdown-menu";

/** Displays the path to the current resource using a hierarchy of links. */
const Breadcrumb = React.forwardRef<
	HTMLElement,
	React.ComponentPropsWithoutRef<"nav"> & {
		separator?: React.ReactNode;
	}
>(({...props}, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
	({className, ...props}, ref) => (
		<ol
			ref={ref}
			className={cn(
				"wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5 wwc:break-words wwc:text-sm wwc:text-muted-foreground wwc:sm:gap-2.5",
				className,
			)}
			{...props}
		/>
	),
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
	({className, ...props}, ref) => (
		<li ref={ref} className={cn("wwc:inline-flex wwc:items-center wwc:gap-1.5", className)} {...props} />
	),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
	HTMLAnchorElement,
	React.ComponentPropsWithoutRef<"a"> & {
		asChild?: boolean;
	}
>(({asChild, className, ...props}, ref) => {
	const Comp = asChild ? Slot : "a";

	return <Comp ref={ref} className={cn("wwc:transition-colors wwc:hover:text-foreground", className)} {...props} />;
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
	({className, ...props}, ref) => (
		<span
			ref={ref}
			role="link"
			aria-disabled="true"
			aria-current="page"
			className={cn("wwc:font-normal wwc:text-foreground", className)}
			{...props}
		/>
	),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({children, className, ...props}: React.ComponentProps<"li">) => (
	<li
		role="presentation"
		aria-hidden="true"
		className={cn("wwc:[&>svg]:w-3.5 wwc:[&>svg]:h-3.5", className)}
		{...props}
	>
		{children ?? <ChevronRight />}
	</li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

/** A collapsed breadcrumb level shown inside the ellipsis dropdown. */
export interface BreadcrumbMenuItem {
	label: React.ReactNode;
	/** Renders the item as a link. */
	href?: string;
	/** Called when the item is chosen (e.g. for client-side routing). */
	onSelect?: () => void;
	disabled?: boolean;
}

/**
 * The "…" between breadcrumbs. Pass `items` (the collapsed middle levels) to make it an
 * interactive dropdown — clicking it opens a menu of those levels (built on the same `DropdownMenu`
 * the toolbar action menus use). Without `items` it renders a static, decorative ellipsis.
 */
const BreadcrumbEllipsis = ({
	className,
	items,
	...props
}: React.ComponentProps<"span"> & {items?: BreadcrumbMenuItem[]}) => {
	if (!items || items.length === 0) {
		return (
			<span
				role="presentation"
				aria-hidden="true"
				className={cn("wwc:flex wwc:h-9 wwc:w-9 wwc:items-center wwc:justify-center", className)}
				{...props}
			>
				<MoreHorizontal className="wwc:h-4 wwc:w-4" />
				<span className="wwc:sr-only">More</span>
			</span>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label="Show collapsed breadcrumbs"
				className={cn(
					"wwc:flex wwc:h-9 wwc:w-9 wwc:items-center wwc:justify-center wwc:rounded-sm wwc:transition-colors wwc:hover:text-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:data-[state=open]:text-foreground",
					className,
				)}
			>
				<MoreHorizontal className="wwc:h-4 wwc:w-4" />
				<span className="wwc:sr-only">More</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				{items.map((item, index) =>
					item.href ? (
						<DropdownMenuItem key={index} asChild disabled={item.disabled}>
							<a href={item.href}>{item.label}</a>
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem key={index} disabled={item.disabled} onSelect={item.onSelect}>
							{item.label}
						</DropdownMenuItem>
					),
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
};
