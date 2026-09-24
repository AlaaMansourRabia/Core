import {cn} from "@corensystem/coren-utils";
import {AlertTriangle, CheckCircle2, Info, OctagonAlert, X} from "lucide-react";
import * as React from "react";

import {Button} from "./button";

export interface BannerProps {
	variant?: "info" | "warning" | "danger" | "success";
	title: string;
	description?: string;
	items?: string[];
	action?: {
		label: string;
		onClick: () => void;
	};
	onDismiss?: () => void;
	className?: string;
}

const variantStyles = {
	info: {
		container: "wwc:bg-card wwc:border-border",
		iconColor: "wwc:text-muted-foreground",
		Icon: Info,
	},
	warning: {
		container: "wwc:bg-card wwc:border-border",
		iconColor: "wwc:text-amber-500",
		Icon: AlertTriangle,
	},
	danger: {
		container: "wwc:bg-card wwc:border-border",
		iconColor: "wwc:text-red-500",
		Icon: OctagonAlert,
	},
	success: {
		container: "wwc:bg-card wwc:border-border",
		iconColor: "wwc:text-green-500",
		Icon: CheckCircle2,
	},
};

/** Contextual alert banner for system insights, warnings, and action prompts. */
function Banner({variant = "info", title, description, items, action, onDismiss, className}: BannerProps) {
	const styles = variantStyles[variant];

	return (
		<div
			className={cn(
				"wwc:flex wwc:items-start wwc:gap-3 wwc:px-4 wwc:py-3 wwc:border wwc:rounded-lg",
				styles.container,
				className,
			)}
		>
			<styles.Icon className={cn("wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:mt-0.5", styles.iconColor)} />
			<div className="wwc:flex-1 wwc:min-w-0">
				<p className="wwc:text-sm wwc:font-semibold wwc:text-foreground">{title}</p>
				{description && <p className="wwc:text-sm wwc:mt-0.5 wwc:text-muted-foreground">{description}</p>}
				{items && items.length > 0 && (
					<ul className="wwc:text-sm wwc:mt-1.5 wwc:space-y-0.5 wwc:text-muted-foreground">
						{items.map((item) => (
							<li key={item}>• {item}</li>
						))}
					</ul>
				)}
				{action && (
					<div className="wwc:mt-2">
						<Button
							size="sm"
							variant={variant === "danger" ? "destructive" : variant === "warning" ? "outline" : "default"}
							onClick={action.onClick}
						>
							{action.label}
						</Button>
					</div>
				)}
			</div>
			{onDismiss && (
				<button
					type="button"
					onClick={onDismiss}
					className="wwc:p-0.5 wwc:rounded-md wwc:hover:bg-black/5 wwc:dark:hover:bg-white/5 wwc:transition-colors wwc:shrink-0 wwc:text-muted-foreground"
				>
					<X className="wwc:h-4 wwc:w-4" />
				</button>
			)}
		</div>
	);
}

export {Banner};
