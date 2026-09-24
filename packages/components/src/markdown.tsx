import {cn} from "@corensystem/coren-utils";
import * as React from "react";

export interface MarkdownProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Raw markdown/HTML content to render */
	children?: React.ReactNode;
	/** Apply prose typography styles */
	prose?: boolean;
	/** Compact mode with tighter spacing */
	compact?: boolean;
}

/**
 * Container for rendering markdown/rich text content with proper typography styles.
 * Applies consistent styling to headings, paragraphs, lists, code blocks, etc.
 */
const Markdown = React.forwardRef<HTMLDivElement, MarkdownProps>(
	({className, prose = true, compact = false, children, ...props}, ref) => (
		<div
			ref={ref}
			className={cn(
				// Base prose styles
				prose && [
					"wwc:prose wwc:prose-sm wwc:dark:prose-invert wwc:max-w-none",
					// Headings
					"wwc:prose-headings:font-semibold wwc:prose-headings:text-foreground",
					"wwc:prose-h1:text-2xl wwc:prose-h2:text-xl wwc:prose-h3:text-lg wwc:prose-h4:text-base",
					// Paragraphs and text
					"wwc:prose-p:text-foreground wwc:prose-p:leading-relaxed",
					// Links
					"wwc:prose-a:text-primary wwc:prose-a:underline wwc:prose-a:underline-offset-2 wwc:hover:prose-a:text-primary/80",
					// Lists
					"wwc:prose-ul:list-disc wwc:prose-ol:list-decimal",
					"wwc:prose-li:text-foreground wwc:prose-li:marker:text-muted-foreground",
					// Code
					"wwc:prose-code:bg-muted wwc:prose-code:px-1.5 wwc:prose-code:py-0.5 wwc:prose-code:rounded wwc:prose-code:text-sm wwc:prose-code:font-mono",
					"wwc:prose-code:before:content-[''] wwc:prose-code:after:content-['']",
					"wwc:prose-pre:bg-muted wwc:prose-pre:p-4 wwc:prose-pre:rounded-lg wwc:prose-pre:overflow-x-auto",
					// Blockquotes
					"wwc:prose-blockquote:border-l-4 wwc:prose-blockquote:border-border wwc:prose-blockquote:pl-4 wwc:prose-blockquote:italic",
					// Tables
					"wwc:prose-table:border-collapse wwc:prose-th:border wwc:prose-th:border-border wwc:prose-th:p-2 wwc:prose-th:bg-muted",
					"wwc:prose-td:border wwc:prose-td:border-border wwc:prose-td:p-2",
					// Images
					"wwc:prose-img:rounded-lg wwc:prose-img:max-w-full",
					// Horizontal rules
					"wwc:prose-hr:border-border",
					// Strong and emphasis
					"wwc:prose-strong:font-semibold wwc:prose-strong:text-foreground",
					"wwc:prose-em:italic",
				],
				// Compact mode reduces spacing
				compact && [
					"wwc:prose-p:my-2 wwc:prose-headings:my-3",
					"wwc:prose-ul:my-2 wwc:prose-ol:my-2 wwc:prose-li:my-0.5",
					"wwc:prose-pre:my-2 wwc:prose-blockquote:my-2",
				],
				className,
			)}
			{...props}
		>
			{children}
		</div>
	),
);
Markdown.displayName = "Markdown";

export {Markdown};
