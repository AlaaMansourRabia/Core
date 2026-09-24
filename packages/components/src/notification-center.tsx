import {cn} from "@corensystem/coren-utils";
import {Bell, ClipboardList, Check, RotateCcw, Trash2, X} from "lucide-react";
import * as React from "react";

import {Badge} from "./badge";
import {Button} from "./button";
import {ScrollArea} from "./scroll-area";

// A floating notification centre, modelled on macOS: a translucent column pinned to the right edge
// with its own rounded cards, rather than an edge-to-edge Sheet. It overlays the app instead of
// pushing it (PushPanel) and it is dismissible by clicking anywhere outside, or with Escape.
//
// It carries two streams because the WC3 shell has two: system notifications, and the changeset —
// the uncommitted mutations every ontology edit lands in before being applied.

export interface NotificationItem {
	id: string;
	title: string;
	body?: string;
	/** Pre-formatted, e.g. "2m ago" — the host owns the clock. */
	time: string;
	unread?: boolean;
	/** Optional grouping label rendered as a chip, e.g. "System". */
	kind?: string;
	tone?: "default" | "success" | "warning" | "danger";
}

export interface ChangeEntry {
	id: string;
	/** Mutation kind, e.g. "create-object-type". */
	kind: string;
	summary: string;
	time: string;
	/** Applied entries are immune to undo, matching the prototype's changeset. */
	committed?: boolean;
	/** False when the mutation's target no longer exists, so undo cannot be offered. */
	undoable?: boolean;
}

export interface NotificationCenterProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	notifications?: NotificationItem[];
	changes?: ChangeEntry[];
	/** Which stream to show. The host drives this from its own top-bar buttons. */
	view?: "notifications" | "changes";
	onDismiss?: (id: string) => void;
	onClearAll?: () => void;
	onUndo?: (id: string) => void;
	onApplyAll?: () => void;
	onDiscardAll?: () => void;
	className?: string;
}

// Tone is carried by a translucent tint and stroke, with the label left on `text-foreground`.
// Two reasons, both from the cards' token inversion (see CenterCard):
//  - the stock *Soft variants colour their label via a `dark:` variant, which keys off the page's
//    `.dark` class and so does NOT follow the inversion — the label would fight the card.
//  - the filled variants (white on green-600/amber-500) drop to 2.1–3.2:1, below AA.
// A token-bound label inherits the card's own foreground, so it stays legible on either colour
// while the tint still reads as green/amber/red.
const TONE_CHIP = {
	default: "wwc:border-border wwc:bg-muted",
	success: "wwc:border-green-600/40 wwc:bg-green-500/15",
	warning: "wwc:border-amber-600/40 wwc:bg-amber-500/15",
	danger: "wwc:border-red-600/40 wwc:bg-red-500/15",
} as const;

/**
 * One floating card. Stacked with gaps rather than dividing a single surface. A hairline ring plus a
 * soft drop shadow define its edge against the frosted material — `ring` rather than `border` so the
 * outline sits outside the box and never shifts the card's own layout.
 *
 * `wwc-invert` (from core-tokens) runs the card on the opposite theme to the page: a charcoal card
 * with light text on a light page, a near-white card with dark text on a dark one. The card reads as
 * an object sitting ON the frosted panel rather than a tinted patch OF it. Because the inversion is
 * done with tokens, every descendant bound to a token — text, muted text, ring, buttons — follows.
 */
function CenterCard({children, className}: {children: React.ReactNode; className?: string}) {
	return (
		<div
			className={cn(
				"wwc-invert",
				"wwc:rounded-xl wwc:bg-card wwc:p-3 wwc:text-card-foreground wwc:ring-1 wwc:ring-border/70 wwc:shadow-lg wwc:shadow-black/[0.07]",
				className,
			)}
		>
			{children}
		</div>
	);
}

function EmptyState({icon: Icon, title, body}: {icon: typeof Bell; title: string; body: string}) {
	return (
		<CenterCard className="wwc:py-8 wwc:text-center">
			<Icon className="wwc:mx-auto wwc:h-6 wwc:w-6 wwc:text-muted-foreground" />
			<p className="wwc:mt-2 wwc:text-sm wwc:font-medium">{title}</p>
			<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">{body}</p>
		</CenterCard>
	);
}

export function NotificationCenter({
	open,
	onOpenChange,
	notifications = [],
	changes = [],
	view = "notifications",
	onDismiss,
	onClearAll,
	onUndo,
	onApplyAll,
	onDiscardAll,
	className,
}: NotificationCenterProps) {
	// Escape closes, matching every other overlay in the system.
	React.useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onOpenChange]);

	if (!open) return null;

	const pending = changes.filter((c) => !c.committed);
	const applied = changes.filter((c) => c.committed);

	return (
		<>
			{/* Click-away target. Transparent — macOS does not dim the desktop behind the centre. */}
			<button
				type="button"
				aria-label="Close notification centre"
				className="wwc:fixed wwc:inset-0 wwc:z-40 wwc:cursor-default"
				onClick={() => onOpenChange(false)}
			/>

			<aside
				aria-label="Notification centre"
				className={cn(
					// Frosted glass. Three things make it read as a material rather than a translucent box:
					//  - blur radius stays moderate (blur-md). Too large averages the backdrop into a flat wash,
					//    which is indistinguishable from a solid fill.
					//  - saturate boost keeps colour behind vivid, so it looks like glass, not grey plastic.
					//  - a vertical gradient in the tint, so the material has depth instead of one flat alpha.
					// No border: separation comes from the material and the cards' shadows, not a stroke.
					"wwc:fixed wwc:bottom-3 wwc:right-3 wwc:top-3 wwc:z-50 wwc:flex wwc:w-[360px] wwc:flex-col wwc:gap-2",
					"wwc:rounded-2xl wwc:bg-gradient-to-b wwc:from-background/70 wwc:to-background/45 wwc:p-2 wwc:text-foreground wwc:shadow-2xl wwc:backdrop-blur-md wwc:backdrop-saturate-150",
					"wwc:animate-in wwc:slide-in-from-right-4 wwc:fade-in-0 wwc:duration-200",
					className,
				)}
			>
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2 wwc:px-1 wwc:pb-1">
					<span className="wwc:text-sm wwc:font-semibold">
						{view === "notifications" ? "Notifications" : "Changes"}
					</span>
					{view === "changes" && changes.length > 0 && (
						<span className="wwc:text-xs wwc:text-muted-foreground">
							{pending.length} uncommitted · {applied.length} applied
						</span>
					)}
					<Button
						variant="ghost"
						size="sm"
						icon
						aria-label="Close"
						className="wwc:ml-auto wwc:h-7 wwc:w-7"
						onClick={() => onOpenChange(false)}
					>
						<X className="wwc:h-4 wwc:w-4" />
					</Button>
				</div>

				<ScrollArea className="wwc:min-h-0 wwc:flex-1">
					<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:pr-1">
						{view === "notifications" ? (
							notifications.length === 0 ? (
								<EmptyState icon={Bell} title="No notifications" body="You're all caught up." />
							) : (
								<>
									{notifications.map((n) => (
										<CenterCard key={n.id} className="wwc:group wwc:relative">
											<div className="wwc:flex wwc:items-start wwc:gap-2">
												{n.unread && (
													<span className="wwc:mt-1.5 wwc:h-2 wwc:w-2 wwc:shrink-0 wwc:rounded-full wwc:bg-primary" />
												)}
												<div className="wwc:min-w-0 wwc:flex-1">
													<div className="wwc:flex wwc:items-center wwc:gap-2">
														<p className="wwc:truncate wwc:text-sm wwc:font-medium">{n.title}</p>
														{n.kind && (
															<Badge
																variant="outline"
																className={cn("wwc:font-normal", TONE_CHIP[n.tone ?? "default"])}
															>
																{n.kind}
															</Badge>
														)}
													</div>
													{n.body && <p className="wwc:mt-0.5 wwc:text-xs wwc:text-muted-foreground">{n.body}</p>}
													<p className="wwc:mt-1 wwc:text-[11px] wwc:text-muted-foreground">{n.time}</p>
												</div>
												{onDismiss && (
													<button
														type="button"
														aria-label={`Dismiss ${n.title}`}
														onClick={() => onDismiss(n.id)}
														// Revealed on hover, as macOS does, but always reachable by keyboard.
														className="wwc:rounded wwc:p-0.5 wwc:text-muted-foreground wwc:opacity-0 wwc:transition-opacity wwc:focus:opacity-100 wwc:group-hover:opacity-100 wwc:hover:text-foreground"
													>
														<X className="wwc:h-3.5 wwc:w-3.5" />
													</button>
												)}
											</div>
										</CenterCard>
									))}
									{onClearAll && (
										<Button variant="ghost" size="sm" className="wwc:self-end wwc:text-xs" onClick={onClearAll}>
											Clear all
										</Button>
									)}
								</>
							)
						) : (
							<>
								{pending.length > 0 && (
									<CenterCard className="wwc:flex wwc:items-center wwc:gap-2 wwc:py-2">
										<div className="wwc:ml-auto wwc:flex wwc:gap-1.5">
											{onApplyAll && (
												<Button size="sm" className="wwc:h-7 wwc:text-xs" onClick={onApplyAll}>
													<Check className="wwc:h-3.5 wwc:w-3.5" />
													Apply all
												</Button>
											)}
											{onDiscardAll && (
												<Button variant="outline" size="sm" className="wwc:h-7 wwc:text-xs" onClick={onDiscardAll}>
													<Trash2 className="wwc:h-3.5 wwc:w-3.5" />
													Discard
												</Button>
											)}
										</div>
									</CenterCard>
								)}

								{pending.length === 0 && applied.length === 0 ? (
									<EmptyState
										icon={ClipboardList}
										title="No uncommitted changes"
										body="Every mutation lands here first, to apply or discard as one set."
									/>
								) : null}

								{pending.map((c) => (
									<CenterCard key={c.id}>
										<div className="wwc:flex wwc:items-center wwc:gap-2">
											<Badge variant="outline" className={cn("wwc:font-mono wwc:font-normal", TONE_CHIP.default)}>
												{c.kind}
											</Badge>
											<span className="wwc:text-[11px] wwc:text-muted-foreground">{c.time}</span>
											{c.undoable !== false && onUndo && (
												<Button
													variant="ghost"
													size="sm"
													className="wwc:ml-auto wwc:h-6 wwc:text-xs"
													onClick={() => onUndo(c.id)}
												>
													<RotateCcw className="wwc:h-3 wwc:w-3" />
													Undo
												</Button>
											)}
											{c.undoable === false && (
												<span className="wwc:ml-auto wwc:text-[10px] wwc:text-muted-foreground">not undoable</span>
											)}
										</div>
										<p className="wwc:mt-1 wwc:text-sm">{c.summary}</p>
									</CenterCard>
								))}

								{applied.length > 0 && (
									<>
										<p className="wwc:px-1 wwc:pt-1 wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
											Applied
										</p>
										{applied.map((c) => (
											<CenterCard key={c.id} className="wwc:opacity-60">
												<div className="wwc:flex wwc:items-center wwc:gap-2">
													<Badge variant="outline" className={cn("wwc:font-mono wwc:font-normal", TONE_CHIP.default)}>
														{c.kind}
													</Badge>
													<span className="wwc:text-[11px] wwc:text-muted-foreground">{c.time}</span>
												</div>
												<p className="wwc:mt-1 wwc:text-sm">{c.summary}</p>
											</CenterCard>
										))}
									</>
								)}
							</>
						)}
					</div>
				</ScrollArea>
			</aside>
		</>
	);
}
