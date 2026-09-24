import {cn} from "@corensystem/coren-utils";
import * as React from "react";

import {Kbd} from "./kbd";

export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
	icon?: React.ReactNode;
	title?: string;
	description?: string;
	action?: React.ReactNode;
}

/** Empty state component for when there is no data to display. */
const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
	({className, icon, title, description, action, children, ...props}, ref) => (
		<div
			ref={ref}
			className={cn(
				// Borderless by design — the empty state is centred content in its pane, not a boxed
				// placeholder. Matches EmptySelection below. Never re-add a dashed border here, and do
				// not wrap this in a bordered container at the call site: that reads as a double frame.
				"wwc:flex wwc:min-h-[400px] wwc:flex-col wwc:items-center wwc:justify-center wwc:p-8 wwc:text-center wwc:animate-in wwc:fade-in-50",
				className,
			)}
			{...props}
		>
			{icon && (
				<div className="wwc:flex wwc:h-20 wwc:w-20 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-muted wwc:text-muted-foreground">
					{icon}
				</div>
			)}
			{title && <h3 className="wwc:mt-4 wwc:text-lg wwc:font-semibold">{title}</h3>}
			{description && (
				<p className="wwc:mb-4 wwc:mt-2 wwc:text-sm wwc:text-muted-foreground wwc:max-w-md">{description}</p>
			)}
			{action && <div className="wwc:mt-2">{action}</div>}
			{children}
		</div>
	),
);
Empty.displayName = "Empty";

const EmptyIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => (
		<div
			ref={ref}
			className={cn(
				"wwc:flex wwc:h-20 wwc:w-20 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-muted",
				className,
			)}
			{...props}
		/>
	),
);
EmptyIcon.displayName = "EmptyIcon";

const EmptyTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({className, ...props}, ref) => (
		<h3 ref={ref} className={cn("wwc:mt-4 wwc:text-lg wwc:font-semibold", className)} {...props} />
	),
);
EmptyTitle.displayName = "EmptyTitle";

const EmptyDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({className, ...props}, ref) => (
		<p ref={ref} className={cn("wwc:mb-4 wwc:mt-2 wwc:text-sm wwc:text-muted-foreground", className)} {...props} />
	),
);
EmptyDescription.displayName = "EmptyDescription";

/* -----------------------------------------------------------------------------
 * EmptySelection — the empty-state variant for a viewer pane with nothing selected.
 *
 * A keyboard-shortcut legend above a "No <noun> selected" message, both centred
 * in the pane. Unlike <Empty> (no data at all) this is for data that exists but
 * nothing is picked yet, so it is borderless and fills its pane in the body
 * color — master/detail surfaces (task monitors, inboxes, list+viewer layouts)
 * all show the same empty viewer.
 *
 * The shortcut list defaults to TaskMonitor's built-in bindings; pass
 * `shortcuts` to describe a different set, or `[]` to drop the legend entirely.
 * -------------------------------------------------------------------------- */

export type EmptySelectionShortcut = {
	/** Keys rendered as <Kbd> chips, in order (e.g. ["N"], ["⌘", "K"]). */
	keys: React.ReactNode[];
	label: string;
};

// `title`/`description` are widened to ReactNode, so the DOM `title` attribute is dropped.
export interface EmptySelectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** Singular noun used in the default copy and shortcut labels. Defaults to "item". */
	itemNoun?: string;
	/** Override the shortcut legend. Defaults to the list+viewer bindings; `[]` hides it. */
	shortcuts?: EmptySelectionShortcut[];
	/** Heading above the shortcut legend. Defaults to "Keyboard shortcuts". */
	shortcutsTitle?: React.ReactNode;
	/** Defaults to "No <itemNoun> selected". */
	title?: React.ReactNode;
	/** Defaults to "Select a <itemNoun> from the list to view details". */
	description?: React.ReactNode;
}

function ShortcutRow({keys, label}: EmptySelectionShortcut) {
	return (
		<li className="wwc:flex wwc:items-center wwc:gap-3">
			<span className="wwc:flex wwc:w-12 wwc:justify-end wwc:gap-1">
				{keys.map((k, i) => (
					<Kbd key={i}>{k}</Kbd>
				))}
			</span>
			<span>{label}</span>
		</li>
	);
}

/** Default bindings — mirrors TaskMonitor's built-in keyboard shortcuts. */
function defaultShortcuts(itemNoun: string): EmptySelectionShortcut[] {
	return [
		{keys: ["N"], label: `Next ${itemNoun}`},
		{keys: ["P"], label: `Previous ${itemNoun}`},
		{keys: ["←"], label: "Previous tab"},
		{keys: ["→"], label: "Next tab"},
		{keys: ["Esc"], label: "Close tab"},
	];
}

const EmptySelection = React.forwardRef<HTMLDivElement, EmptySelectionProps>(
	(
		{className, itemNoun = "item", shortcuts, shortcutsTitle = "Keyboard shortcuts", title, description, ...props},
		ref,
	) => {
		const article = /^[aeiou]/i.test(itemNoun) ? "an" : "a";
		const rows = shortcuts ?? defaultShortcuts(itemNoun);

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:flex wwc:h-full wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-8 wwc:bg-background wwc:p-6",
					className,
				)}
				{...props}
			>
				{rows.length > 0 && (
					<div className="wwc:flex wwc:flex-col wwc:gap-2.5">
						<h4 className="wwc:text-center wwc:text-sm wwc:font-semibold wwc:text-foreground">{shortcutsTitle}</h4>
						<ul className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:text-sm wwc:text-muted-foreground">
							{rows.map((row) => (
								<ShortcutRow key={row.label} keys={row.keys} label={row.label} />
							))}
						</ul>
					</div>
				)}
				<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-1 wwc:text-center">
					<h3 className="wwc:text-base wwc:font-semibold wwc:text-foreground">{title ?? `No ${itemNoun} selected`}</h3>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						{description ?? `Select ${article} ${itemNoun} from the list to view details`}
					</p>
				</div>
			</div>
		);
	},
);
EmptySelection.displayName = "EmptySelection";

export {Empty, EmptyIcon, EmptyTitle, EmptyDescription, EmptySelection};
