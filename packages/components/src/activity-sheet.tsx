import {Check, ClipboardList, Inbox, Undo2, X} from "lucide-react";

import {Badge} from "./badge";
import {Button} from "./button";
import {Card} from "./card";
import {Empty} from "./empty";
import type {ChangeEntry, NotificationItem} from "./notification-center";
import {ScrollArea} from "./scroll-area";
import {Sheet, SheetContent, SheetHeader, SheetTitle} from "./sheet";
import {ViewTabBar} from "./view-tab-bar";

// The notifications / changeset panel as an ordinary right-hand Sheet: standard overlay, standard
// cards, standard buttons. Nothing here is special-cased — which is the point, and why it replaced a
// bespoke translucent surface that never sat right against the rest of the shell.
//
// Two streams behind one panel: transient NOTIFICATIONS you dismiss, and a CHANGESET of edits that
// accumulate until applied or discarded. It reuses NotificationCenter's item types, so a shell can
// feed both from the state it already keeps.

export type ActivityView = "notifications" | "changes";

const TONE_BADGE: Record<string, string> = {
	success: "wwc:border-transparent wwc:bg-green-100 wwc:text-green-700",
	danger: "wwc:border-transparent wwc:bg-red-100 wwc:text-red-700",
	warning: "wwc:border-transparent wwc:bg-amber-100 wwc:text-amber-700",
};

export function ActivitySheet({
	open,
	view,
	onOpenChange,
	onViewChange,
	notifications,
	changes,
	onDismiss,
	onClearAll,
	onUndo,
	onApplyAll,
	onDiscardAll,
}: {
	open: boolean;
	view: ActivityView;
	onOpenChange: (open: boolean) => void;
	onViewChange: (view: ActivityView) => void;
	notifications: NotificationItem[];
	changes: ChangeEntry[];
	onDismiss: (id: string) => void;
	onClearAll: () => void;
	onUndo: (id: string) => void;
	onApplyAll: () => void;
	onDiscardAll: () => void;
}) {
	const unread = notifications.filter((n) => n.unread).length;
	const pending = changes.filter((c) => !c.committed).length;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="wwc:flex wwc:w-full wwc:flex-col wwc:gap-0 wwc:p-0 wwc:sm:max-w-md">
				<SheetHeader className="wwc:space-y-3 wwc:border-b wwc:p-4 wwc:text-left">
					<SheetTitle className="wwc:text-base wwc:font-semibold">Activity</SheetTitle>
					<ViewTabBar
						tabs={[
							{id: "notifications", label: "Notifications", icon: Inbox, badge: unread || undefined},
							{id: "changes", label: "Changeset", icon: ClipboardList, badge: pending || undefined},
						]}
						activeTab={view}
						onTabChange={(next) => onViewChange(next as ActivityView)}
					/>
				</SheetHeader>

				<ScrollArea className="wwc:min-h-0 wwc:flex-1" scrollbarClassName="wwc:w-1.5" thumbClassName="wwc:bg-border/60">
					<div className="wwc:space-y-2 wwc:p-4">
						{view === "notifications" ? (
							notifications.length === 0 ? (
								<Empty
									className="wwc:min-h-[240px]"
									icon={<Inbox className="wwc:h-6 wwc:w-6" />}
									title="No notifications"
									description="You're all caught up."
								/>
							) : (
								notifications.map((item) => (
									<Card key={item.id} className="wwc:gap-2 wwc:p-3">
										<div className="wwc:flex wwc:items-start wwc:gap-2">
											<div className="wwc:min-w-0 wwc:flex-1">
												<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
													<span className="wwc:text-[13px] wwc:font-medium wwc:text-foreground">{item.title}</span>
													{item.kind && (
														<Badge
															variant="secondary"
															className={`wwc:h-5 wwc:text-[10px] ${item.tone ? TONE_BADGE[item.tone] : ""}`}
														>
															{item.kind}
														</Badge>
													)}
													{item.unread && <span className="wwc:h-1.5 wwc:w-1.5 wwc:rounded-full wwc:bg-primary" />}
												</div>
												<p className="wwc:mt-0.5 wwc:text-[12px] wwc:text-muted-foreground">{item.body}</p>
												<p className="wwc:mt-1 wwc:text-[11px] wwc:text-muted-foreground/70">{item.time}</p>
											</div>
											<Button
												variant="ghost"
												icon
												aria-label={`Dismiss ${item.title}`}
												className="wwc:h-7 wwc:w-7 wwc:shrink-0 wwc:text-muted-foreground"
												onClick={() => onDismiss(item.id)}
											>
												<X className="wwc:h-3.5 wwc:w-3.5" />
											</Button>
										</div>
									</Card>
								))
							)
						) : changes.length === 0 ? (
							<Empty
								className="wwc:min-h-[240px]"
								icon={<ClipboardList className="wwc:h-6 wwc:w-6" />}
								title="No changes"
								description="Edits you make will collect here until you apply them."
							/>
						) : (
							changes.map((entry) => (
								<Card key={entry.id} className="wwc:gap-2 wwc:p-3">
									<div className="wwc:flex wwc:items-start wwc:gap-2">
										<div className="wwc:min-w-0 wwc:flex-1">
											<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
												<span className="wwc:text-[13px] wwc:font-medium wwc:text-foreground">{entry.summary}</span>
												{entry.committed && (
													<Badge variant="secondary" className="wwc:h-5 wwc:text-[10px]">
														Applied
													</Badge>
												)}
											</div>
											<p className="wwc:mt-0.5 wwc:text-[11px] wwc:text-muted-foreground/70">
												{entry.kind} · {entry.time}
											</p>
										</div>
										{entry.undoable && !entry.committed && (
											<Button
												variant="outline"
												size="sm"
												className="wwc:h-7 wwc:shrink-0 wwc:gap-1.5"
												onClick={() => onUndo(entry.id)}
											>
												<Undo2 className="wwc:h-3.5 wwc:w-3.5" />
												Undo
											</Button>
										)}
									</div>
								</Card>
							))
						)}
					</div>
				</ScrollArea>

				{/* Footer actions belong to whichever stream is showing. */}
				<div className="wwc:flex wwc:items-center wwc:justify-end wwc:gap-2 wwc:border-t wwc:p-4">
					{view === "notifications" ? (
						<Button variant="outline" size="sm" disabled={notifications.length === 0} onClick={onClearAll}>
							Clear all
						</Button>
					) : (
						<>
							<Button variant="outline" size="sm" disabled={pending === 0} onClick={onDiscardAll}>
								Discard
							</Button>
							<Button size="sm" className="wwc:gap-1.5" disabled={pending === 0} onClick={onApplyAll}>
								<Check className="wwc:h-3.5 wwc:w-3.5" />
								Apply all
							</Button>
						</>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
