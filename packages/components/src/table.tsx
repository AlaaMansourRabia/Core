import {cn} from "@corensystem/core-utils";
import * as React from "react";

/** A semantic HTML table with composable sub-components for structured data. */
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
	({className, ...props}, ref) => (
		<div className="wwc:relative wwc:w-full wwc:overflow-hidden">
			<table
				ref={ref}
				className={cn("wwc:w-full wwc:caption-bottom wwc:text-sm wwc:table-fixed", className)}
				{...props}
			/>
		</div>
	),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({className, ...props}, ref) => (
		<thead
			ref={ref}
			// Muted band so the column labels read as a header strip against the white body rows.
			className={cn("wwc:bg-muted wwc:[&_tr]:border-b wwc:[&_tr]:hover:bg-muted", className)}
			{...props}
		/>
	),
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({className, ...props}, ref) => (
		<tbody ref={ref} className={cn("wwc:[&_tr:last-child]:border-0", className)} {...props} />
	),
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({className, ...props}, ref) => (
		<tfoot
			ref={ref}
			className={cn("wwc:border-t wwc:bg-muted/50 wwc:font-medium wwc:[&>tr]:last:border-b-0", className)}
			{...props}
		/>
	),
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
	({className, ...props}, ref) => (
		<tr
			ref={ref}
			className={cn(
				"wwc:border-b wwc:transition-colors wwc:hover:bg-muted/50 wwc:data-[state=selected]:bg-muted",
				className,
			)}
			{...props}
		/>
	),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
	({className, ...props}, ref) => (
		<th
			ref={ref}
			className={cn(
				"wwc:h-10 wwc:px-3 wwc:text-left wwc:align-middle wwc:font-medium wwc:text-foreground wwc:truncate wwc:[&:has([role=checkbox])]:pr-0 wwc:[&>[role=checkbox]]:translate-y-[2px]",
				className,
			)}
			{...props}
		/>
	),
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
	({className, ...props}, ref) => (
		<td
			ref={ref}
			className={cn(
				"wwc:px-3 wwc:py-2 wwc:align-middle wwc:truncate wwc:max-w-0 wwc:[&:has([role=checkbox])]:pr-0 wwc:[&>[role=checkbox]]:translate-y-[2px]",
				className,
			)}
			{...props}
		/>
	),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
	({className, ...props}, ref) => (
		<caption ref={ref} className={cn("wwc:mt-4 wwc:text-sm wwc:text-muted-foreground", className)} {...props} />
	),
);
TableCaption.displayName = "TableCaption";

export {Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption};
