import {cn} from "@corensystem/coren-utils";
import * as React from "react";

export interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
	/** Show dividers between items */
	divided?: boolean;
	/** Render as ordered list */
	ordered?: boolean;
}

/** A generic list component for displaying items. */
const List = React.forwardRef<HTMLUListElement | HTMLOListElement, ListProps>(
	({className, divided, ordered, children, ...props}, ref) => {
		const Component = ordered ? "ol" : "ul";
		return (
			<Component
				ref={ref as React.Ref<HTMLUListElement> & React.Ref<HTMLOListElement>}
				className={cn(
					"wwc:space-y-0",
					divided && "wwc:divide-y wwc:divide-border",
					ordered && "wwc:list-decimal wwc:list-inside",
					!ordered && "wwc:list-none",
					className,
				)}
				{...props}
			>
				{children}
			</Component>
		);
	},
);
List.displayName = "List";

export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
	/** Show as interactive/clickable item */
	interactive?: boolean;
}

/** A list item component. */
const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(({className, interactive, ...props}, ref) => {
	return (
		<li
			ref={ref}
			className={cn(
				"wwc:py-2 wwc:px-3",
				interactive && "wwc:cursor-pointer wwc:hover:bg-accent wwc:hover:text-accent-foreground wwc:transition-colors",
				className,
			)}
			{...props}
		/>
	);
});
ListItem.displayName = "ListItem";

export {List, ListItem};
