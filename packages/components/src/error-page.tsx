import {cn} from "@wakecap/core-utils";
import * as React from "react";

type ErrorType = "404" | "401" | "403" | "500" | "503" | "generic";

interface ErrorConfig {
	code: string;
	title: string;
	description: string;
}

const errorConfigs: Record<ErrorType, ErrorConfig> = {
	"404": {
		code: "404",
		title: "Page Not Found",
		description: "The page you're looking for doesn't exist or has been moved.",
	},
	"401": {
		code: "401",
		title: "Unauthorized",
		description: "You need to be authenticated to access this page.",
	},
	"403": {
		code: "403",
		title: "Forbidden",
		description: "You don't have permission to access this resource.",
	},
	"500": {
		code: "500",
		title: "Server Error",
		description: "Something went wrong on our end. Please try again later.",
	},
	"503": {
		code: "503",
		title: "Service Unavailable",
		description: "The service is temporarily unavailable. Please try again later.",
	},
	generic: {
		code: "Error",
		title: "Something Went Wrong",
		description: "An unexpected error occurred. Please try again.",
	},
};

export interface ErrorPageProps extends React.HTMLAttributes<HTMLDivElement> {
	type?: ErrorType;
	code?: string;
	title?: string;
	description?: string;
	action?: React.ReactNode;
	showCode?: boolean;
}

/** Full-page error display with predefined configs for common HTTP errors. */
const ErrorPage = React.forwardRef<HTMLDivElement, ErrorPageProps>(
	({className, type = "generic", code, title, description, action, showCode = true, children, ...props}, ref) => {
		const config = errorConfigs[type];
		const displayCode = code ?? config.code;
		const displayTitle = title ?? config.title;
		const displayDescription = description ?? config.description;

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:flex wwc:min-h-[400px] wwc:flex-col wwc:items-center wwc:justify-center wwc:p-8 wwc:text-center",
					className,
				)}
				{...props}
			>
				{showCode && (
					<p className="wwc:text-6xl wwc:font-semibold wwc:tracking-tight wwc:text-foreground">{displayCode}</p>
				)}
				<h1 className="wwc:mt-3 wwc:text-lg wwc:font-medium wwc:text-foreground">{displayTitle}</h1>
				<p className="wwc:mt-1 wwc:max-w-sm wwc:text-sm wwc:text-muted-foreground">{displayDescription}</p>
				{action && <div className="wwc:mt-6">{action}</div>}
				{children}
			</div>
		);
	},
);
ErrorPage.displayName = "ErrorPage";

// Compound components for custom composition

const ErrorPageCode = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({className, ...props}, ref) => (
		<p
			ref={ref}
			className={cn("wwc:text-6xl wwc:font-semibold wwc:tracking-tight wwc:text-foreground", className)}
			{...props}
		/>
	),
);
ErrorPageCode.displayName = "ErrorPageCode";

const ErrorPageTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({className, ...props}, ref) => (
		<h1 ref={ref} className={cn("wwc:mt-3 wwc:text-lg wwc:font-medium wwc:text-foreground", className)} {...props} />
	),
);
ErrorPageTitle.displayName = "ErrorPageTitle";

const ErrorPageDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({className, ...props}, ref) => (
		<p ref={ref} className={cn("wwc:mt-1 wwc:max-w-sm wwc:text-sm wwc:text-muted-foreground", className)} {...props} />
	),
);
ErrorPageDescription.displayName = "ErrorPageDescription";

const ErrorPageAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => <div ref={ref} className={cn("wwc:mt-6 wwc:flex wwc:gap-2", className)} {...props} />,
);
ErrorPageAction.displayName = "ErrorPageAction";

export {ErrorPage, ErrorPageCode, ErrorPageTitle, ErrorPageDescription, ErrorPageAction};
