import type {ChangeEntry, NotificationItem} from "@corensystem/core-ui/notification-center";
import type {Meta, StoryObj} from "storybook/internal/types";

import {ActivitySheet, type ActivityView} from "@corensystem/core-ui/activity-sheet";
import {Button} from "@corensystem/core-ui/button";
import {useState} from "react";

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
	{
		id: "n3",
		title: "Ontology lint: 1 error",
		body: "Direct Schema Translation on Lint Demo: Badge Events Raw Table",
		time: "1h ago",
		unread: true,
		kind: "Health",
		tone: "warning",
	},
	{
		id: "n4",
		title: "Product installed",
		body: "labour v2026-06-02.v1 added 3 object types",
		time: "3h ago",
		kind: "Products",
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
	{id: "c2", kind: "create-link-type", summary: "Created link type “Sites / Project”", time: "2m ago", undoable: true},
	{id: "c3", kind: "add-property", summary: "Added property “contractor” to Worker", time: "6m ago", undoable: false},
	{
		id: "c4",
		kind: "create-object-type",
		summary: "Created object type “Site Inspection”",
		time: "20m ago",
		committed: true,
	},
];

const meta = {
	title: "Widgets/Activity/Activity Sheet",
	component: ActivitySheet,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"The app shell's activity panel as an ordinary right-hand Sheet — standard overlay, standard cards, standard buttons — so it sits flush with the rest of the shell. Two streams behind one surface: transient **notifications** you dismiss, and a **changeset** of edits that accumulate until applied or discarded. It takes NotificationCenter's `NotificationItem` and `ChangeEntry` types, so a shell can feed both from the state it already keeps.",
			},
		},
	},
} satisfies Meta<typeof ActivitySheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function ActivitySheetDemo({initialView}: {initialView: ActivityView}) {
	const [open, setOpen] = useState(true);
	const [view, setView] = useState<ActivityView>(initialView);
	const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
	const [changes, setChanges] = useState(SEED_CHANGES);

	return (
		<div className="wwc:flex wwc:h-screen wwc:items-start wwc:gap-2 wwc:p-6">
			<Button variant="outline" onClick={() => setOpen(true)}>
				Open activity
			</Button>
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

export const Notifications: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"The notifications stream: one card per item with its source badge, an unread dot, and a dismiss control. **Clear all** empties the stream; the tab badge counts unread.",
			},
		},
	},
	render: () => <ActivitySheetDemo initialView="notifications" />,
};

export const Changeset: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"The changeset stream: edits collected since the last commit. Undoable entries carry an **Undo**; already-applied ones are marked and drop it. The footer offers **Discard** and **Apply all**, both disabled once nothing is pending — the tab badge counts what is.",
			},
		},
	},
	render: () => <ActivitySheetDemo initialView="changes" />,
};
