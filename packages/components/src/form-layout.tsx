import {cn} from "@corensystem/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const formLayoutVariants = cva("wwc:w-full", {
	variants: {
		layout: {
			vertical: "wwc:space-y-6",
			horizontal: "wwc:space-y-4",
			inline: "wwc:flex wwc:flex-wrap wwc:gap-4 wwc:items-end",
		},
		size: {
			sm: "wwc:max-w-sm",
			md: "wwc:max-w-md",
			lg: "wwc:max-w-lg",
			xl: "wwc:max-w-xl",
			full: "wwc:max-w-full",
		},
	},
	defaultVariants: {
		layout: "vertical",
		size: "full",
	},
});

export interface FormLayoutProps
	extends React.FormHTMLAttributes<HTMLFormElement>, VariantProps<typeof formLayoutVariants> {}

/** Layout container for forms with consistent spacing and sizing. */
const FormLayout = React.forwardRef<HTMLFormElement, FormLayoutProps>(
	({className, layout, size, children, ...props}, ref) => (
		<form ref={ref} className={cn(formLayoutVariants({layout, size}), className)} {...props}>
			{children}
		</form>
	),
);
FormLayout.displayName = "FormLayout";

export interface FormSectionProps extends React.HTMLAttributes<HTMLFieldSetElement> {
	/** Section title */
	title?: string;
	/** Section description */
	description?: string;
}

/** Grouped section within a form. */
const FormSection = React.forwardRef<HTMLFieldSetElement, FormSectionProps>(
	({className, title, description, children, ...props}, ref) => (
		<fieldset ref={ref} className={cn("wwc:space-y-4 wwc:border-0 wwc:p-0 wwc:m-0", className)} {...props}>
			{(title || description) && (
				<div className="wwc:space-y-1">
					{title && <legend className="wwc:text-base wwc:font-semibold wwc:text-foreground">{title}</legend>}
					{description && <p className="wwc:text-sm wwc:text-muted-foreground">{description}</p>}
				</div>
			)}
			<div className="wwc:space-y-4">{children}</div>
		</fieldset>
	),
);
FormSection.displayName = "FormSection";

export interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Number of columns (for horizontal layouts) */
	columns?: 1 | 2 | 3 | 4;
}

/** Row within a form for grouping fields horizontally. */
const FormRow = React.forwardRef<HTMLDivElement, FormRowProps>(({className, columns = 2, children, ...props}, ref) => {
	const gridCols = {
		1: "wwc:grid-cols-1",
		2: "wwc:grid-cols-1 wwc:sm:grid-cols-2",
		3: "wwc:grid-cols-1 wwc:sm:grid-cols-2 wwc:lg:grid-cols-3",
		4: "wwc:grid-cols-1 wwc:sm:grid-cols-2 wwc:lg:grid-cols-4",
	};

	return (
		<div ref={ref} className={cn("wwc:grid wwc:gap-4", gridCols[columns], className)} {...props}>
			{children}
		</div>
	);
});
FormRow.displayName = "FormRow";

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Alignment of actions */
	align?: "left" | "center" | "right" | "between";
}

/** Container for form action buttons. */
const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
	({className, align = "right", children, ...props}, ref) => {
		const alignClasses = {
			left: "wwc:justify-start",
			center: "wwc:justify-center",
			right: "wwc:justify-end",
			between: "wwc:justify-between",
		};

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:flex wwc:items-center wwc:gap-3 wwc:pt-4 wwc:border-t wwc:border-border",
					alignClasses[align],
					className,
				)}
				{...props}
			>
				{children}
			</div>
		);
	},
);
FormActions.displayName = "FormActions";

export {FormLayout, FormSection, FormRow, FormActions, formLayoutVariants};
