import {cn} from "@corensystem/coren-utils";
import * as React from "react";

export type AttentionTone = "danger" | "warning" | "info";

const TONE: Record<AttentionTone, {row: string; badge: string; icon: string; value: string}> = {
	danger: {
		row: "wwc:border-red-500/20 wwc:bg-red-500/5",
		badge: "wwc:bg-red-500/10",
		icon: "wwc:text-red-600",
		value: "wwc:text-red-600",
	},
	warning: {
		row: "wwc:border-amber-500/20 wwc:bg-amber-500/5",
		badge: "wwc:bg-amber-500/10",
		icon: "wwc:text-amber-600",
		value: "wwc:text-amber-600",
	},
	info: {
		row: "wwc:border-blue-500/20 wwc:bg-blue-500/5",
		badge: "wwc:bg-blue-500/10",
		icon: "wwc:text-blue-600",
		value: "wwc:text-blue-600",
	},
};

export interface AttentionListItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title" | "value"> {
	/** Leading icon, shown in a tinted circle. */
	icon?: React.ReactNode;
	title: React.ReactNode;
	/** Secondary line under the title — ids, codes, owners. */
	subtitle?: React.ReactNode;
	/** Headline figure on the right, tinted by `tone` (e.g. "548 days overdue"). */
	value?: React.ReactNode;
	/** Muted line under the value (e.g. a due date). */
	valueCaption?: React.ReactNode;
	/** Trailing slot for a row action — a link or button. */
	action?: React.ReactNode;
	tone?: AttentionTone;
}

/** One worklist row: what needs attention, how badly, and what to do about it. */
const AttentionListItem = React.forwardRef<HTMLLIElement, AttentionListItemProps>(
	({icon, title, subtitle, value, valueCaption, action, tone = "danger", className, ...props}, ref) => {
		const t = TONE[tone];
		return (
			<li
				ref={ref}
				className={cn(
					"wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3 wwc:rounded-lg wwc:border wwc:p-3",
					t.row,
					className,
				)}
				{...props}
			>
				{icon && (
					<span
						className={cn(
							"wwc:flex wwc:h-8 wwc:w-8 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-full",
							t.badge,
							t.icon,
						)}
					>
						{icon}
					</span>
				)}

				<div className="wwc:min-w-0 wwc:flex-1">
					<p className="wwc:truncate wwc:font-medium">{title}</p>
					{subtitle && <p className="wwc:text-xs wwc:text-muted-foreground">{subtitle}</p>}
				</div>

				{(value || valueCaption) && (
					<div className="wwc:shrink-0 wwc:text-right">
						{value && <p className={cn("wwc:text-sm wwc:font-medium", t.value)}>{value}</p>}
						{valueCaption && <p className="wwc:text-xs wwc:text-muted-foreground">{valueCaption}</p>}
					</div>
				)}

				{action && <div className="wwc:shrink-0">{action}</div>}
			</li>
		);
	},
);
AttentionListItem.displayName = "AttentionListItem";

export interface AttentionListProps extends React.HTMLAttributes<HTMLUListElement> {
	children: React.ReactNode;
	/** Shown in place of the rows when there is nothing to action. */
	emptyMessage?: React.ReactNode;
}

/** Vertical stack of `AttentionListItem`s — the "what needs doing today" worklist. */
const AttentionList = React.forwardRef<HTMLUListElement, AttentionListProps>(
	({children, emptyMessage, className, ...props}, ref) => {
		const isEmpty = React.Children.count(children) === 0;
		if (isEmpty && emptyMessage) {
			return <p className="wwc:py-6 wwc:text-center wwc:text-sm wwc:text-muted-foreground">{emptyMessage}</p>;
		}
		return (
			<ul ref={ref} className={cn("wwc:flex wwc:flex-col wwc:gap-2", className)} {...props}>
				{children}
			</ul>
		);
	},
);
AttentionList.displayName = "AttentionList";

export {AttentionList, AttentionListItem};
