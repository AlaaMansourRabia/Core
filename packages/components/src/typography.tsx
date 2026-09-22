import {cn} from "@corensystem/core-utils";
import * as React from "react";

// Sizes and weights here are IMPORTANT — see the note in section-header.tsx. These render semantic
// h1-h4; our utilities live in `@layer utilities`, and any unlayered `h1 {}` in a host app beats a
// layered one however specific. styles.tw4.css ships no reset by design, so a consumer that brings
// none would otherwise get the browser's heading scale wearing our class names.

const TypographyH1 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({className, ...props}, ref) => (
		<h1
			ref={ref}
			className={cn("wwc:scroll-m-20 wwc:text-4xl! wwc:font-extrabold! wwc:tracking-tight wwc:lg:text-5xl!", className)}
			{...props}
		/>
	),
);
TypographyH1.displayName = "TypographyH1";

const TypographyH2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({className, ...props}, ref) => (
		<h2
			ref={ref}
			className={cn(
				"wwc:scroll-m-20 wwc:border-b wwc:pb-2 wwc:text-3xl! wwc:font-semibold! wwc:tracking-tight wwc:first:mt-0",
				className,
			)}
			{...props}
		/>
	),
);
TypographyH2.displayName = "TypographyH2";

const TypographyH3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({className, ...props}, ref) => (
		<h3
			ref={ref}
			className={cn("wwc:scroll-m-20 wwc:text-2xl! wwc:font-semibold! wwc:tracking-tight", className)}
			{...props}
		/>
	),
);
TypographyH3.displayName = "TypographyH3";

const TypographyH4 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({className, ...props}, ref) => (
		<h4
			ref={ref}
			className={cn("wwc:scroll-m-20 wwc:text-xl! wwc:font-semibold! wwc:tracking-tight", className)}
			{...props}
		/>
	),
);
TypographyH4.displayName = "TypographyH4";

/** Typography components for consistent text styling across the design system. */
const TypographyP = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({className, ...props}, ref) => (
		<p ref={ref} className={cn("wwc:leading-7 wwc:[&:not(:first-child)]:mt-6", className)} {...props} />
	),
);
TypographyP.displayName = "TypographyP";

const TypographyBlockquote = React.forwardRef<HTMLQuoteElement, React.HTMLAttributes<HTMLQuoteElement>>(
	({className, ...props}, ref) => (
		<blockquote ref={ref} className={cn("wwc:mt-6 wwc:border-l-2 wwc:pl-6 wwc:italic", className)} {...props} />
	),
);
TypographyBlockquote.displayName = "TypographyBlockquote";

const TypographyInlineCode = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
	({className, ...props}, ref) => (
		<code
			ref={ref}
			className={cn(
				"wwc:relative wwc:rounded wwc:bg-muted wwc:px-[0.3rem] wwc:py-[0.2rem] wwc:font-mono wwc:text-sm wwc:font-semibold",
				className,
			)}
			{...props}
		/>
	),
);
TypographyInlineCode.displayName = "TypographyInlineCode";

const TypographyLead = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({className, ...props}, ref) => (
		<p ref={ref} className={cn("wwc:text-xl wwc:text-muted-foreground", className)} {...props} />
	),
);
TypographyLead.displayName = "TypographyLead";

const TypographyLarge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => (
		<div ref={ref} className={cn("wwc:text-lg wwc:font-semibold", className)} {...props} />
	),
);
TypographyLarge.displayName = "TypographyLarge";

const TypographySmall = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
	({className, ...props}, ref) => (
		<small ref={ref} className={cn("wwc:text-sm wwc:font-medium wwc:leading-none", className)} {...props} />
	),
);
TypographySmall.displayName = "TypographySmall";

const TypographyMuted = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({className, ...props}, ref) => (
		<p ref={ref} className={cn("wwc:text-sm wwc:text-muted-foreground", className)} {...props} />
	),
);
TypographyMuted.displayName = "TypographyMuted";

export {
	TypographyH1,
	TypographyH2,
	TypographyH3,
	TypographyH4,
	TypographyP,
	TypographyBlockquote,
	TypographyInlineCode,
	TypographyLead,
	TypographyLarge,
	TypographySmall,
	TypographyMuted,
};
