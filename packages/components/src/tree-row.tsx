import {cn} from "@corensystem/core-utils";
import {ChevronDown, ChevronRight} from "lucide-react";
import {type MouseEvent, type ReactNode, type RefObject, useLayoutEffect, useRef, useState} from "react";

/** Middle-truncates a string: truncates the head with an ellipsis, always keeping the last `tail` chars. */
function MiddleLabel({text, tail}: {text: string; tail: number}) {
	if (text.length <= tail) return <>{text}</>;
	return (
		<span className="wwc:flex wwc:min-w-0 wwc:items-center wwc:overflow-hidden">
			<span className="wwc:min-w-0 wwc:overflow-hidden wwc:text-ellipsis wwc:whitespace-pre">
				{text.slice(0, -tail)}
			</span>
			{/* `whitespace-pre`: the split lands mid-name, and these are two flex items, so a space at the
			    boundary would collapse — "Built assets" rendered as "Builtassets". */}
			<span className="wwc:shrink-0 wwc:whitespace-pre">{text.slice(-tail)}</span>
		</span>
	);
}

export interface TreeRowContentProps {
	/** Indentation depth level (0 = root) */
	level: number;
	/** Whether this row has expandable children */
	expandable?: boolean;
	/** Whether the row is currently expanded */
	expanded?: boolean;
	/** Called when the chevron or label is clicked. Use for expand/collapse. */
	onToggle?: () => void;
	/**
	 * Whether clicking the label toggles expansion (calls `onToggle`). Default `true`. Set `false`
	 * to make only the chevron toggle, letting label/empty-space clicks fall through to the row's
	 * `onClick` instead.
	 */
	labelTogglesExpand?: boolean;
	/** Icon element rendered after the chevron */
	icon?: ReactNode;
	/** Primary label text */
	label: string;
	/**
	 * Long-name handling. Omit for plain end truncation (CSS ellipsis, no tooltip). Set `"end"`
	 * to add a hover tooltip with the full label when it overflows, `"middle"` to truncate the head
	 * while keeping the tail visible (good for filenames), or `"clamp"` to let the label wrap onto
	 * multiple lines up to `maxLines` and then truncate. All add a tooltip with the full label.
	 */
	truncate?: "end" | "middle" | "clamp";
	/** For `truncate="middle"`, how many trailing characters to always keep visible. Default 7. */
	tailChars?: number;
	/** For `truncate="clamp"`, the maximum number of wrapped lines before truncating. Default 3. */
	maxLines?: number;
	/**
	 * Whether this row is the selected one. In `truncate="clamp"` mode the selected row wraps to
	 * show its full name while the others fall back to single-line middle truncation.
	 */
	selected?: boolean;
	/** Font weight class (defaults based on level) */
	fontWeight?: "wwc:font-normal" | "wwc:font-medium" | "wwc:font-semibold" | "wwc:font-bold";
	/** Custom chevron color class override */
	chevronClassName?: string;
	/** Custom label text class override */
	textClassName?: string;
	/** Custom class for the leading icon wrapper. */
	iconClassName?: string;
	/** Pixels of indent per level (default 20) */
	indentPx?: number;
}

/**
 * The inner content of a tree row: indent + chevron + icon + label.
 * Use this when you need to embed tree-row content inside a custom container
 * (e.g. a TableCell). For a standalone clickable row, use TreeRow instead.
 */
export function TreeRowContent({
	level,
	expandable,
	expanded,
	onToggle,
	labelTogglesExpand = true,
	truncate,
	tailChars = 7,
	maxLines = 3,
	selected = false,
	icon,
	label,
	fontWeight,
	chevronClassName,
	textClassName,
	iconClassName,
	indentPx = 20,
}: TreeRowContentProps) {
	const resolvedFontWeight = fontWeight ?? (level === 0 ? "wwc:font-semibold" : "wwc:font-medium");

	const handleToggle = (e: MouseEvent) => {
		e.stopPropagation();
		onToggle?.();
	};

	// "clamp" mode: the selected row wraps to show its full name; every other row falls back to
	// single-line middle truncation. "end"/"middle" behave the same for every row.
	const usesClamp = truncate === "clamp" && selected;
	const usesMiddle = truncate === "middle" || (truncate === "clamp" && !selected);
	const tooltipEnabled = truncate !== undefined;
	const labelRef = useRef<HTMLElement>(null);
	const [overflowing, setOverflowing] = useState(false);
	useLayoutEffect(() => {
		if (!tooltipEnabled || usesMiddle) return;
		const el = labelRef.current;
		if (!el) return;
		const check = () =>
			setOverflowing(usesClamp ? el.scrollHeight > el.clientHeight + 1 : el.scrollWidth > el.clientWidth + 1);
		check();
		const observer = new ResizeObserver(check);
		observer.observe(el);
		return () => observer.disconnect();
	}, [tooltipEnabled, usesMiddle, usesClamp, label, maxLines]);

	const title = tooltipEnabled
		? usesMiddle
			? label.length > tailChars
				? label
				: undefined
			: overflowing
				? label
				: undefined
		: undefined;

	const labelClass = cn(
		"wwc:min-w-0",
		usesClamp ? "wwc:break-words" : usesMiddle ? "wwc:flex wwc:items-center wwc:overflow-hidden" : "wwc:truncate",
		resolvedFontWeight,
		textClassName,
	);
	const labelStyle = usesClamp
		? ({
				display: "-webkit-box",
				WebkitBoxOrient: "vertical" as const,
				WebkitLineClamp: maxLines,
				overflow: "hidden",
			} as const)
		: undefined;
	const labelInner = usesMiddle ? <MiddleLabel text={label} tail={tailChars} /> : label;

	return (
		<div
			className={cn("wwc:flex wwc:min-w-0 wwc:gap-1.5", usesClamp ? "wwc:items-start" : "wwc:items-center")}
			style={{paddingLeft: `${level * indentPx}px`}}
		>
			{expandable ? (
				<button
					type="button"
					onClick={handleToggle}
					aria-label={expanded ? "Collapse" : "Expand"}
					data-treerow-toggle=""
					className="wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-sm wwc:hover:bg-foreground/10"
				>
					{expanded ? (
						<ChevronDown className={cn("wwc:h-3.5 wwc:w-3.5", chevronClassName || "wwc:text-foreground")} />
					) : (
						<ChevronRight className={cn("wwc:h-3.5 wwc:w-3.5", chevronClassName || "wwc:text-foreground")} />
					)}
				</button>
			) : (
				<span className="wwc:w-3.5 wwc:shrink-0" />
			)}
			{icon && <span className={cn("wwc:flex wwc:shrink-0 wwc:items-center", iconClassName)}>{icon}</span>}
			{expandable && labelTogglesExpand ? (
				<button
					ref={labelRef as RefObject<HTMLButtonElement>}
					type="button"
					onClick={handleToggle}
					title={title}
					style={labelStyle}
					data-treerow-toggle=""
					className={cn("wwc:text-left wwc:bg-transparent", labelClass)}
				>
					{labelInner}
				</button>
			) : (
				<span ref={labelRef as RefObject<HTMLSpanElement>} title={title} style={labelStyle} className={labelClass}>
					{labelInner}
				</span>
			)}
		</div>
	);
}

export interface TreeRowProps extends TreeRowContentProps {
	/** Unique identifier for this row */
	id: string;
	/** Called when the row body (empty space) is clicked. Use for selection. */
	onClick?: () => void;
	/** Trailing content (badges, counts, etc.) */
	trailing?: ReactNode;
	/** Visual style variant */
	variant?: "default" | "active" | "selected" | "neutral-selected" | "muted";
	/** Left border accent color class from your own CSS (e.g. "border-primary") */
	accentBorder?: string;
	/** Custom background class override */
	bgClassName?: string;
	/**
	 * Position within a contiguous group of selected rows. When set, adjacent selected rows
	 * collapse their borders and rounding so the group reads as a single block.
	 * - "first": rounded top, square bottom
	 * - "middle": no rounding, no top border
	 * - "last": square top, rounded bottom, no top border
	 */
	groupPosition?: "first" | "middle" | "last";
}

/**
 * A standalone clickable hierarchical row with chevron toggle, icon, label, and optional trailing
 * content. Use for building expandable tree-style lists; embed `TreeRowContent` inside custom
 * containers (e.g. table cells) instead.
 */
export function TreeRow({
	level,
	expandable,
	expanded,
	onClick,
	onToggle,
	labelTogglesExpand,
	truncate,
	tailChars,
	maxLines,
	icon,
	label,
	trailing,
	variant = "default",
	accentBorder,
	bgClassName,
	textClassName,
	iconClassName,
	fontWeight,
	chevronClassName,
	indentPx = 20,
	groupPosition,
}: TreeRowProps) {
	const isSelectedGroup = variant === "selected" && groupPosition !== undefined;

	const variantStyles = {
		default: "wwc:hover:bg-muted/50 wwc:rounded-sm",
		active: "wwc:bg-primary/10 wwc:rounded-sm",
		selected: isSelectedGroup
			? "wwc:bg-primary/10 wwc:relative wwc:z-10"
			: "wwc:bg-primary/10 wwc:ring-2 wwc:ring-primary wwc:relative wwc:z-10 wwc:rounded-sm",
		"neutral-selected": "wwc:relative wwc:z-10 wwc:rounded-sm wwc:bg-muted wwc:text-foreground wwc:hover:bg-muted/80",
		muted: "wwc:rounded-sm",
	};

	const groupStyles =
		groupPosition === "first"
			? "wwc:rounded-t-sm wwc:rounded-b-none"
			: groupPosition === "middle"
				? "wwc:rounded-none"
				: groupPosition === "last"
					? "wwc:rounded-b-sm wwc:rounded-t-none"
					: "";

	// For grouped selected rows, draw the outline with outset box-shadow so it sits
	// outside the layout box (no height change) and adjacent rows' side shadows touch
	// continuously without breaking the outline at the join.
	const primary = "var(--primary)";
	const groupShadow =
		groupPosition === "first"
			? `0 -2px 0 ${primary}, -2px 0 0 ${primary}, 2px 0 0 ${primary}`
			: groupPosition === "middle"
				? `-2px 0 0 ${primary}, 2px 0 0 ${primary}`
				: groupPosition === "last"
					? `0 2px 0 ${primary}, -2px 0 0 ${primary}, 2px 0 0 ${primary}`
					: undefined;

	return (
		<div
			role="button"
			tabIndex={0}
			className={cn(
				"wwc:group wwc:relative wwc:flex wwc:w-full wwc:items-center wwc:gap-1.5 wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:text-left wwc:transition-colors wwc:cursor-pointer wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring",
				variantStyles[variant],
				groupStyles,
				accentBorder && `wwc:border-l-2 ${accentBorder}`,
				bgClassName,
			)}
			style={groupShadow ? {boxShadow: groupShadow} : undefined}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick?.();
				}
			}}
		>
			<TreeRowContent
				level={level}
				expandable={expandable}
				expanded={expanded}
				onToggle={onToggle ?? onClick}
				labelTogglesExpand={labelTogglesExpand}
				truncate={truncate}
				tailChars={tailChars}
				maxLines={maxLines}
				selected={variant === "selected" || variant === "neutral-selected"}
				icon={icon}
				label={label}
				fontWeight={fontWeight}
				chevronClassName={chevronClassName}
				textClassName={textClassName}
				iconClassName={iconClassName}
				indentPx={indentPx}
			/>
			{trailing && (
				<>
					<span className="wwc:flex-1" />
					{trailing}
				</>
			)}
		</div>
	);
}
