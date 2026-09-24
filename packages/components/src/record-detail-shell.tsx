import {cn} from "@corensystem/coren-utils";
import * as React from "react";

import {SideMenu, type SideMenuGroup} from "./side-menu";

/**
 * The nav-beside-content row shared by every record detail page that earns a section rail.
 *
 * **Only reach for this when the record genuinely has a lot of detail.** A record with three short
 * sections stacks them full-width instead and needs no rail at all — the interface, pipeline and
 * shared-property detail pages all say so in their own comments, and they are right. A rail over two
 * screens of content is chrome, not navigation.
 *
 * The shell owns three things the four shipped detail pages each re-typed: the `md`-breakpoint
 * column flip, the `min-h-0` chain that keeps the content column scrolling instead of the page, and
 * the padded content well. It does NOT own the page header above it — every record's header carries
 * its own identity and actions, and there is nothing shared there to extract.
 *
 * ```tsx
 * <RecordDetailShell title="Object type" sections={sections} activeSectionId={tab} onSectionChange={setTab}>
 *   {tab === "overview" && <OverviewTab … />}
 *   {tab === "properties" && <PropertiesTab … />}
 * </RecordDetailShell>
 * ```
 */

export interface RecordDetailShellProps {
	/** Heading of the section rail — the record's TYPE, not its name. "Object type", "Process". */
	title: string;
	/** The sections, grouped. Ids are what `activeSectionId` and `onSectionChange` speak in. */
	sections: SideMenuGroup[];
	activeSectionId?: string;
	onSectionChange?: (id: string) => void;
	/**
	 * Render the content as a direct flex child instead of inside the padded, scrolling well — for a
	 * section that owns the page height itself, such as a full-bleed graph canvas. When this is set
	 * the section must manage its own padding, overflow and `min-h-0` chain.
	 */
	flush?: boolean;
	/** Extra classes on the outer row. */
	className?: string;
	/** Extra classes on the padded content well. Ignored when `flush`. */
	contentClassName?: string;
	children: React.ReactNode;
}

/** Left section rail beside a single scrolling content column. */
export function RecordDetailShell({
	title,
	sections,
	activeSectionId,
	onSectionChange,
	flush = false,
	className,
	contentClassName,
	children,
}: RecordDetailShellProps) {
	return (
		<div
			data-core-artifact="record-detail-shell"
			className={cn("wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:md:flex-row", className)}
		>
			{/* The rail never searches: a record has a handful of sections, and a search box over six
			    items is furniture. */}
			<SideMenu
				title={title}
				showSearch={false}
				groups={sections}
				activeItemId={activeSectionId}
				onItemSelect={onSectionChange}
			/>

			{flush ? (
				children
			) : (
				// Two nested divs on purpose: the outer one is the scroll owner and must stay unpadded,
				// or the padding scrolls with the content and the last section loses its bottom gutter.
				<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
					<div className={cn("wwc:w-full wwc:space-y-4 wwc:p-6", contentClassName)}>{children}</div>
				</div>
			)}
		</div>
	);
}
