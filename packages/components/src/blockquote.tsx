import {cn} from "@core/core-utils";
import * as React from "react";

export interface BlockquoteProps extends React.BlockquoteHTMLAttributes<HTMLQuoteElement> {
	/** Optional citation or attribution */
	cite?: string;
	/** Optional author/source to display */
	attribution?: React.ReactNode;
}

/** A styled blockquote element for quotations. */
const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(
	({className, children, cite, attribution, ...props}, ref) => {
		return (
			<blockquote
				ref={ref}
				cite={cite}
				className={cn(
					"wwc:border-l-4 wwc:border-primary wwc:pl-4 wwc:italic wwc:text-muted-foreground",
					className,
				)}
				{...props}
			>
				{children}
				{attribution && (
					<footer className="wwc:mt-2 wwc:text-sm wwc:not-italic wwc:text-foreground">
						— {attribution}
					</footer>
				)}
			</blockquote>
		);
	},
);
Blockquote.displayName = "Blockquote";

export {Blockquote};
