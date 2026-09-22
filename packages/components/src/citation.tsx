import {cn} from "@corensystem/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const citationVariants = cva("wwc:text-muted-foreground", {
	variants: {
		size: {
			sm: "wwc:text-xs",
			md: "wwc:text-sm",
			lg: "wwc:text-base",
		},
		variant: {
			default: "wwc:italic",
			plain: "",
		},
	},
	defaultVariants: {
		size: "sm",
		variant: "default",
	},
});

export interface CitationProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof citationVariants> {
	/** URL or reference for the citation */
	href?: string;
	/** Author of the cited work */
	author?: string;
	/** Source/publication name */
	source?: string;
	/** Date of publication */
	date?: string;
}

/** Typography primitive for citing sources, quotes, or references. */
const Citation = React.forwardRef<HTMLElement, CitationProps>(
	({className, size, variant, href, author, source, date, children, ...props}, ref) => {
		const content = (
			<>
				{children && <span>{children}</span>}
				{author && <span className="wwc:font-medium">{author}</span>}
				{source && (
					<>
						{author && ", "}
						<cite className="wwc:not-italic">{source}</cite>
					</>
				)}
				{date && (
					<>
						{(author || source) && " "}
						<time className="wwc:tabular-nums">({date})</time>
					</>
				)}
			</>
		);

		if (href) {
			return (
				<a
					ref={ref as React.Ref<HTMLAnchorElement>}
					href={href}
					className={cn(
						citationVariants({size, variant}),
						"wwc:hover:text-foreground wwc:underline wwc:underline-offset-2",
						className,
					)}
					target="_blank"
					rel="noopener noreferrer"
					{...props}
				>
					{content}
				</a>
			);
		}

		return (
			<footer ref={ref} className={cn(citationVariants({size, variant}), className)} {...props}>
				— {content}
			</footer>
		);
	},
);
Citation.displayName = "Citation";

export {Citation, citationVariants};
