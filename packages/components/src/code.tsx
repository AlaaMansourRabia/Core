import {cn} from "@corensystem/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const codeVariants = cva("wwc:relative wwc:rounded wwc:px-1.5 wwc:py-0.5 wwc:font-mono wwc:text-sm", {
	variants: {
		variant: {
			default: "wwc:bg-muted wwc:text-foreground",
			outline: "wwc:border wwc:border-border wwc:bg-background wwc:text-foreground",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export interface CodeProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof codeVariants> {}

/** Inline code element with monospace styling. */
const Code = React.forwardRef<HTMLElement, CodeProps>(({className, variant, ...props}, ref) => {
	return <code ref={ref} className={cn(codeVariants({variant, className}))} {...props} />;
});
Code.displayName = "Code";

const codeBlockVariants = cva(
	"wwc:relative wwc:rounded-lg wwc:border wwc:border-border wwc:bg-muted wwc:p-4 wwc:font-mono wwc:text-sm",
	{
		variants: {
			variant: {
				default: "",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement>, VariantProps<typeof codeBlockVariants> {
	/** Show line numbers */
	showLineNumbers?: boolean;
}

/** Multi-line code block with monospace styling. */
const CodeBlock = React.forwardRef<HTMLPreElement, CodeBlockProps>(
	({className, variant, children, showLineNumbers, ...props}, ref) => {
		return (
			<pre ref={ref} className={cn(codeBlockVariants({variant, className}))} {...props}>
				<code className="wwc:block wwc:overflow-x-auto">{children}</code>
			</pre>
		);
	},
);
CodeBlock.displayName = "CodeBlock";

export {Code, codeVariants, CodeBlock, codeBlockVariants};
