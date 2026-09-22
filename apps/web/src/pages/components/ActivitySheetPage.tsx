import type {ChangeEntry, NotificationItem} from "@core/core-ui/notification-center";

import {ActivitySheet, type ActivityView} from "@core/core-ui/activity-sheet";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

const props: {prop: string; type: string; def: string; desc: string}[] = [
	{prop: "open", type: "boolean", def: "—", desc: "Whether the sheet is showing."},
	{prop: "view", type: '"notifications" | "changes"', def: "—", desc: "Which stream is on top."},
	{prop: "onOpenChange", type: "(open: boolean) => void", def: "—", desc: "Fires when the sheet is dismissed."},
	{prop: "onViewChange", type: "(view: ActivityView) => void", def: "—", desc: "Fires when the tabs switch stream."},
	{prop: "notifications", type: "NotificationItem[]", def: "—", desc: "Transient items, each dismissable."},
	{prop: "changes", type: "ChangeEntry[]", def: "—", desc: "Pending edits; committed ones read as applied."},
	{prop: "onDismiss", type: "(id: string) => void", def: "—", desc: "Dismiss one notification."},
	{prop: "onClearAll", type: "() => void", def: "—", desc: "Empty the notifications stream."},
	{prop: "onUndo", type: "(id: string) => void", def: "—", desc: "Undo one pending change."},
	{prop: "onApplyAll", type: "() => void", def: "—", desc: "Commit every pending change."},
	{prop: "onDiscardAll", type: "() => void", def: "—", desc: "Drop every pending change."},
];

const SEED_NOTIFICATIONS: NotificationItem[] = [
	{
		id: "n1",
		title: "Pipeline run finished",
		body: "BIM ingest upserted 2 new elements",
		time: "2m ago",
		unread: true,
		kind: "Pipelines",
		tone: "success",
	},
	{
		id: "n2",
		title: "Permit PT-706 suspended",
		body: "Zone still shows 10 workers on site",
		time: "18m ago",
		unread: true,
		kind: "Safety",
		tone: "danger",
	},
];

const SEED_CHANGES: ChangeEntry[] = [
	{
		id: "c1",
		kind: "update-object-type",
		summary: "Renamed “Worker” visibility to Prominent",
		time: "just now",
		undoable: true,
	},
	{
		id: "c2",
		kind: "create-object-type",
		summary: "Created object type “Site Inspection”",
		time: "20m ago",
		committed: true,
	},
];

export function ActivitySheetPage() {
	const [open, setOpen] = useState(false);
	const [view, setView] = useState<ActivityView>("notifications");
	const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
	const [changes, setChanges] = useState(SEED_CHANGES);

	const openAt = (next: ActivityView) => {
		setView(next);
		setOpen(true);
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Activity Sheet</h1>
					<CopyButton
						value="Activity Sheet"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					The app shell's activity panel as an ordinary right-hand Sheet — standard overlay, standard cards, standard
					buttons — so it sits flush with the rest of the shell. Two streams behind one surface: transient notifications
					you dismiss, and a changeset of edits that accumulate until applied or discarded.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Example</CardTitle>
				</CardHeader>
				<CardContent className="wwc:flex wwc:gap-2">
					<Button variant="outline" onClick={() => openAt("notifications")}>
						Open notifications
					</Button>
					<Button variant="outline" onClick={() => openAt("changes")}>
						Open changeset
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Props</CardTitle>
				</CardHeader>
				<CardContent>
					<table className="wwc:w-full wwc:text-sm">
						<thead>
							<tr className="wwc:border-b wwc:text-left wwc:text-muted-foreground">
								<th className="wwc:py-2 wwc:pr-4 wwc:font-medium">Prop</th>
								<th className="wwc:py-2 wwc:pr-4 wwc:font-medium">Type</th>
								<th className="wwc:py-2 wwc:pr-4 wwc:font-medium">Default</th>
								<th className="wwc:py-2 wwc:font-medium">Description</th>
							</tr>
						</thead>
						<tbody>
							{props.map((p) => (
								<tr key={p.prop} className="wwc:border-b wwc:last:border-0">
									<td className="wwc:py-2 wwc:pr-4 wwc:font-mono wwc:text-[13px]">{p.prop}</td>
									<td className="wwc:py-2 wwc:pr-4 wwc:font-mono wwc:text-[12px] wwc:text-muted-foreground">
										{p.type}
									</td>
									<td className="wwc:py-2 wwc:pr-4 wwc:text-muted-foreground">{p.def}</td>
									<td className="wwc:py-2 wwc:text-muted-foreground">{p.desc}</td>
								</tr>
							))}
						</tbody>
					</table>
				</CardContent>
			</Card>

			<ActivitySheet
				open={open}
				view={view}
				onOpenChange={setOpen}
				onViewChange={setView}
				notifications={notifications}
				changes={changes}
				onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
				onClearAll={() => setNotifications([])}
				onUndo={(id) => setChanges((prev) => prev.filter((c) => c.id !== id))}
				onApplyAll={() => setChanges((prev) => prev.map((c) => ({...c, committed: true})))}
				onDiscardAll={() => setChanges((prev) => prev.filter((c) => c.committed))}
			/>
		</div>
	);
}
