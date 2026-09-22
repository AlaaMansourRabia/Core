import {cn} from "@corensystem/core-utils";
import * as React from "react";

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	title: React.ReactNode;
	/** Supporting line under the title. Omit for a bare heading above a band of tiles. */
	description?: React.ReactNode;
	/** Right-aligned slot for the section's actions (buttons, links, search). */
	actions?: React.ReactNode;
	/** Heading level rendered. Defaults to `h2`; use `h1` when the section owns the page. */
	as?: "h1" | "h2" | "h3";
	/** `md` (default) for page sections, `sm` for a heading above a row of tiles. */
	size?: "sm" | "md";
}

/**
 * Title (+ optional description) on the left, actions on the right — the heading that sits above a
 * page section, settings pane, or band of tiles. Use this rather than an ad-hoc `h2` + `p` pair so
 * every section reads at the same size and spacing.
 */
const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
	({title, description, actions, as: Heading = "h2", size = "md", className, ...props}, ref) => (
		<div
			ref={ref}
			className={cn("wwc:mb-4 wwc:flex wwc:items-start wwc:justify-between wwc:gap-4", className)}
			{...props}
		>
			<div className="wwc:min-w-0">
				{/*
				 * Size, weight and margin are IMPORTANT, and the reason is the same one PageContentHeader
				 * documents: this renders a semantic h1/h2/h3, our utilities live in `@layer utilities`,
				 * and ANY unlayered `h2 {}` rule in a host app beats a layered one however specific it
				 * is. `styles.tw4.css` ships no reset by design — a TW4 consumer is expected to bring its
				 * own — so a host that brings none leaves the browser's `1.5em bold` in charge and every
				 * section heading in the library reads as a page title. A section header that renders at
				 * the host's h2 size is not a section header.
				 *
				 * `m-0!` for the same reason: the UA heading margin would open a gap this component's own
				 * `mb-4` already owns.
				 */}
				<Heading
					className={cn(
						"wwc:m-0! wwc:font-semibold! wwc:tracking-tight",
						size === "md" ? "wwc:text-xl!" : "wwc:text-base!",
					)}
				>
					{title}
				</Heading>
				{description && <p className="wwc:mt-1 wwc:text-sm wwc:text-muted-foreground">{description}</p>}
			</div>
			{actions && <div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">{actions}</div>}
		</div>
	),
);
SectionHeader.displayName = "SectionHeader";

export {SectionHeader};
