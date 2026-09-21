// A CONSUMER's view of the sidebar: this file uses `CoreAppSidebar` the way a product team would —
// its own group and item names, its own tones from the shared palette, its own notifications, and a
// handler for every gesture — and asserts that each one reports back. Its job is to catch anything a
// developer cannot reach from props: hardcoded copy, fixture data with no way to replace it, a
// gesture with no callback.
//
// The stylesheet is loaded because these are POINTER tests; without it the rail lays out inline and
// clicks land on the wrong element.
import "../../dist/styles.css";
import {Boxes, FileText, FolderTree, Share2, Workflow} from "lucide-react";
import {expect, test} from "vitest";
import {render} from "vitest-browser-react";

import {toneFor} from "../tones";
import {CoreAppSidebar, type SidebarNavGroup, type SidebarNotification} from "./core-app-sidebar";

// The shape a real app has: sections that mean something, items with real names, tones taken from the
// palette by position rather than written out by hand.
const NAV: SidebarNavGroup[] = [
	{
		id: "design",
		label: "Design",
		icon: Boxes,
		collapsible: true,
		items: [
			{id: "site-reality", label: "Site Reality", icon: FileText, tone: toneFor(0, 0)},
			{id: "equipment", label: "Equipment", icon: FileText, tone: toneFor(1, 0)},
		],
	},
	{
		id: "studio",
		label: "Studio",
		icon: Workflow,
		collapsible: true,
		dividerBefore: true,
		items: [
			{id: "pipelines", label: "Pipelines", icon: Share2, tone: toneFor(0, 5)},
			{id: "ontology", label: "Ontology", icon: Boxes, tone: toneFor(1, 5)},
		],
	},
];

const NOTIFICATIONS: SidebarNotification[] = [
	{id: "a", title: "Pipeline run finished", body: "BIM ingest upserted 2 elements", time: "2m ago", unread: true},
	{id: "b", title: "Permit suspended", body: "PT-706 was suspended", time: "1h ago", unread: true},
	{id: "c", title: "Report ready", time: "1d ago"},
];

const settle = () => new Promise((r) => setTimeout(r, 150));

type Log = {
	navigated: string[];
	items: string[];
	home: number;
	files: number;
	search: number;
	viewAll: number;
	selected: string[];
};

async function renderAsConsumer(overrides: Record<string, unknown> = {}) {
	const log: Log = {navigated: [], items: [], home: 0, files: 0, search: 0, viewAll: 0, selected: []};
	const ui = await render(
		<div style={{height: "700px", display: "flex"}}>
			<CoreAppSidebar
				viewLevel="org"
				variant="tree"
				brandName="Connect"
				orgGroups={NAV}
				groupsCollapsedByDefault={false}
				pinnedTop={{id: "files", label: "Files", icon: FolderTree, onSelect: () => (log.files += 1)}}
				showHome
				onHome={() => (log.home += 1)}
				showSearch
				onSearch={() => (log.search += 1)}
				showMarketplace={false}
				notifications={NOTIFICATIONS}
				unreadNotifications={NOTIFICATIONS.filter((n) => n.unread).length}
				onNotificationSelect={(n) => log.selected.push(n.id)}
				onViewAllNotifications={() => (log.viewAll += 1)}
				onNavigate={(label) => log.navigated.push(label)}
				onNavigateItem={(item) => log.items.push(item.id)}
				user={{name: "Sara Haddad", email: "sara@example.com"}}
				{...overrides}
			/>
		</div>,
	);
	return {log, ui};
}

test("every nav item reports its own id and label to the consumer", async () => {
	const {log, ui} = await renderAsConsumer();
	await ui.getByText("Pipelines", {exact: true}).click();
	await settle();
	// Both callbacks fire: the label for routing by name, the item for routing by id.
	expect(log.navigated).toContain("Pipelines");
	expect(log.items).toContain("pipelines");
});

test("the pinned shell surfaces each report through their own handler", async () => {
	const {log, ui} = await renderAsConsumer();
	await ui.getByText("Files", {exact: true}).click();
	await ui.getByText("Home", {exact: true}).click();
	await ui.getByText("Search", {exact: true}).click();
	await settle();
	expect({files: log.files, home: log.home, search: log.search}).toEqual({files: 1, home: 1, search: 1});
});

test("the panel lists the CONSUMER's notifications, not a built-in fixture", async () => {
	const {log, ui} = await renderAsConsumer();
	await ui.getByText("Notifications", {exact: true}).click();
	await settle();
	const panel = document.querySelector("[data-radix-popper-content-wrapper]") as HTMLElement;
	expect(panel.textContent).toContain("Pipeline run finished");
	expect(panel.textContent).toContain("Permit suspended");
	// Nothing from the widget's own sample leaks through.
	expect(panel.textContent).not.toContain("Deployment succeeded");
	// A title-only notification renders without an empty supporting line.
	expect(panel.textContent).toContain("Report ready");

	// A real <button>, not a div wearing role="button".
	const row = [...panel.querySelectorAll("button")].find((el) =>
		el.textContent?.includes("Permit suspended"),
	) as HTMLElement;
	expect(row.tagName).toBe("BUTTON");
	row.click();
	await settle();
	expect(log.selected).toEqual(["b"]);
});

test("the unread count the consumer passes is the one shown", async () => {
	const {ui} = await renderAsConsumer();
	const row = [...ui.container.querySelectorAll("button")].find((b) =>
		b.textContent?.trim().startsWith("Notifications"),
	);
	expect(row?.textContent).toContain("2");
});

test("an empty notifications list shows an empty state, not a fixture", async () => {
	const {ui} = await renderAsConsumer({notifications: [], unreadNotifications: 0});
	await ui.getByText("Notifications", {exact: true}).click();
	await settle();
	const panel = document.querySelector("[data-radix-popper-content-wrapper]") as HTMLElement;
	expect(panel.textContent).toContain("You're all caught up");
	expect(panel.textContent).not.toContain("Deployment succeeded");
});

test("all user-facing copy can be replaced for another language", async () => {
	const {ui} = await renderAsConsumer({
		searchLabel: "بحث",
		homeLabel: "الرئيسية",
		notificationsLabel: "الإشعارات",
		labels: {viewAllNotifications: "عرض الكل", collapseSidebar: "طي"},
	});
	expect(ui.container.textContent).toContain("بحث");
	expect(ui.container.textContent).toContain("الرئيسية");
	expect(ui.container.textContent).toContain("الإشعارات");
	expect(ui.container.querySelector('button[aria-label="طي"]')).not.toBeNull();

	await ui.getByText("الإشعارات", {exact: true}).click();
	await settle();
	expect(document.querySelector("[data-radix-popper-content-wrapper]")?.textContent).toContain("عرض الكل");
});

test("the signed-in user comes from props, with no placeholder left behind", async () => {
	const {ui} = await renderAsConsumer();
	expect(ui.container.textContent).toContain("Sara Haddad");
	expect(ui.container.textContent).not.toContain("Abdullah");
});

test("selection is controlled by the consumer's route, not by DOM clicks", async () => {
	const {ui} = await renderAsConsumer({activeItemId: "ontology"});
	const active = [...ui.container.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Ontology");
	expect(active?.className).toContain("bg-muted");
	const other = [...ui.container.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Pipelines");
	expect(other?.className).not.toContain("wwc:bg-muted wwc:font-medium");
});

// One prop does two jobs: it binds the command shortcut and puts the hint on the row, so a consumer
// cannot end up with a binding nobody can discover or a hint that opens nothing.
test("the search shortcut both binds the key and shows its hint", async () => {
	const {log, ui} = await renderAsConsumer({searchShortcut: "j"});
	const row = [...ui.container.querySelectorAll("button")].find((b) => b.textContent?.trim().startsWith("Search"));
	// ⌘ on Apple, Ctrl+ elsewhere — whichever this runner is, the key letter is shown.
	expect(row?.textContent).toMatch(/[⌘J]|Ctrl\+J/);
	expect(row?.querySelector("kbd")).not.toBeNull();

	// The combination works wherever focus happens to be, not only on the row.
	document.body.dispatchEvent(new KeyboardEvent("keydown", {key: "j", metaKey: true, bubbles: true}));
	await settle();
	expect(log.search).toBe(1);

	document.body.dispatchEvent(new KeyboardEvent("keydown", {key: "j", ctrlKey: true, bubbles: true}));
	await settle();
	expect(log.search).toBe(2);
});

test("the shortcut ignores near misses and is absent without the prop", async () => {
	const bound = await renderAsConsumer({searchShortcut: "j"});
	// A bare "j" is typing, not a command; so is adding another modifier.
	document.body.dispatchEvent(new KeyboardEvent("keydown", {key: "j", bubbles: true}));
	document.body.dispatchEvent(new KeyboardEvent("keydown", {key: "j", metaKey: true, shiftKey: true, bubbles: true}));
	document.body.dispatchEvent(new KeyboardEvent("keydown", {key: "k", metaKey: true, bubbles: true}));
	await settle();
	expect(bound.log.search).toBe(0);

	const unbound = await renderAsConsumer();
	const row = [...unbound.ui.container.querySelectorAll("button")].find((b) =>
		b.textContent?.trim().startsWith("Search"),
	);
	expect(row?.querySelector("kbd"), "no hint without the prop").toBeNull();
	document.body.dispatchEvent(new KeyboardEvent("keydown", {key: "j", metaKey: true, bubbles: true}));
	await settle();
	expect(unbound.log.search).toBe(0);
});
