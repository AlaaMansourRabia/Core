// Real clicks against real layout. The rest of the sidebar's tests assert on classes, which is enough
// for styling but not for a POINTER interaction: without the stylesheet the rail's icons lay out
// inline instead of stacked, and the flyout lands on top of them, so every click lands on the wrong
// element. Loading the built stylesheet makes the geometry faithful — at the cost of needing
// `@wakecap/core-ui` built first, which its tests already require.
import "../../dist/styles.css";
import {FileText, Folder} from "lucide-react";
import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {userEvent} from "vitest/browser";

import {CoreAppSidebar, type SidebarNavGroup} from "./core-app-sidebar";

const GROUPS: SidebarNavGroup[] = [
	{
		id: "design",
		label: "Design",
		icon: Folder,
		collapsible: true,
		items: [{id: "d1", label: "Blueprints", icon: FileText}],
	},
	{
		id: "plan",
		label: "Plan",
		icon: Folder,
		collapsible: true,
		items: [{id: "p1", label: "Schedule", icon: FileText}],
	},
];

const openFlyout = () =>
	[...document.querySelectorAll("[data-radix-popper-content-wrapper] button")]
		.map((b) => b.textContent?.trim())
		.join(",");

const settle = () => new Promise((r) => setTimeout(r, 150));

const renderRail = () =>
	render(
		<div style={{height: "600px", display: "flex"}}>
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={GROUPS}
				variant="tree"
				collapsed
				brandName="Connect"
				pinnedTop={{id: "files", label: "Files", icon: Folder}}
				showHome
				showSearch
				showMarketplace={false}
			/>
		</div>,
	);

// Clicking straight from one group's icon to another's must SWITCH, not merely dismiss. The decision
// is taken on pointerdown so it lands before the old flyout's dismissal and before React remounts the
// rail — `RailFlyout` is declared inside the render body, so its identity changes on every state
// change and the whole subtree remounts underneath the interaction.
test("one press switches from one group's flyout to another's", async () => {
	const s = await renderRail();
	await s.getByLabelText("Design").click();
	await settle();
	expect(openFlyout()).toContain("Blueprints");

	await s.getByLabelText("Plan").click();
	await settle();
	expect(openFlyout(), "one press should switch, not just close").toContain("Schedule");
	expect(openFlyout()).not.toContain("Blueprints");
});

test("a hovered icon — tooltip showing — still switches on one press", async () => {
	const s = await renderRail();
	await s.getByLabelText("Design").click();
	await settle();
	expect(openFlyout()).toContain("Blueprints");

	// Dwell past the 300ms tooltip delay, the way a real pointer does.
	await s.getByLabelText("Plan").hover();
	await new Promise((r) => setTimeout(r, 450));
	await s.getByLabelText("Plan").click();
	await settle();
	expect(openFlyout()).toContain("Schedule");
});

test("pressing the open group's own icon closes it", async () => {
	const s = await renderRail();
	await s.getByLabelText("Design").click();
	await settle();
	expect(openFlyout()).toContain("Blueprints");

	await s.getByLabelText("Design").click();
	await settle();
	expect(openFlyout()).toBe("");
});

// The pointer path can't serve the keyboard — Enter and Space never fire pointerdown.
test("Enter and Space toggle the flyout from the keyboard", async () => {
	await renderRail();
	const icon = [...document.querySelectorAll("[data-rail-flyout]")].find(
		(b) => b.getAttribute("aria-label") === "Design",
	) as HTMLElement;
	icon.focus();
	await userEvent.keyboard("{Enter}");
	await settle();
	expect(openFlyout(), "Enter should open the flyout").toContain("Blueprints");

	icon.focus();
	await userEvent.keyboard(" ");
	await settle();
	expect(openFlyout(), "Space should close it again").toBe("");
});

// Selecting a row must still navigate and dismiss.
test("choosing a row in the flyout closes it", async () => {
	const s = await renderRail();
	await s.getByLabelText("Design").click();
	await settle();
	const row = [...document.querySelectorAll("[data-radix-popper-content-wrapper] button")].find(
		(b) => b.textContent?.trim() === "Blueprints",
	) as HTMLElement;
	row.click();
	await settle();
	expect(openFlyout()).toBe("");
});

// The notifications panel has to be reachable from the RAIL too, not just the expanded nav. It was
// not: `RailIconButton` rendered a tooltip wrapper as its root and declared a fixed prop list, so
// Radix's `asChild` trigger had nothing to attach its handlers or ref to and the icon was inert.
test("the notifications panel opens from the collapsed rail", async () => {
	const s = await render(
		<div style={{height: "600px", display: "flex"}}>
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={GROUPS}
				variant="tree"
				collapsed
				showHome={false}
				showSearch={false}
				showMarketplace={false}
				unreadNotifications={3}
				onViewAllNotifications={() => {}}
			/>
		</div>,
	);
	await s.getByLabelText("Notifications").click();
	await settle();
	const panel = document.querySelector("[data-radix-popper-content-wrapper]");
	expect(panel?.textContent, "the rail should open the notifications panel").toContain("Deployment succeeded");
	expect(panel?.textContent).toContain("View all notifications");
});

test("the unread count shows on the rail icon and in the expanded row", async () => {
	const collapsed = await render(
		<div style={{height: "600px", display: "flex"}}>
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={GROUPS}
				variant="tree"
				collapsed
				showHome={false}
				showSearch={false}
				showMarketplace={false}
				unreadNotifications={3}
			/>
		</div>,
	);
	const railIcon = [...collapsed.container.querySelectorAll("button")].find(
		(b) => b.getAttribute("aria-label") === "Notifications",
	);
	expect(railIcon?.textContent).toContain("3");

	const expanded = await render(
		<div style={{height: "600px", display: "flex"}}>
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={GROUPS}
				variant="tree"
				showHome={false}
				showSearch={false}
				showMarketplace={false}
				unreadNotifications={3}
			/>
		</div>,
	);
	const row = [...expanded.container.querySelectorAll("button")].find((b) =>
		b.textContent?.trim().startsWith("Notifications"),
	);
	expect(row?.textContent).toContain("3");
});

test("no count is shown when nothing is unread, and 99+ caps", async () => {
	const none = await render(
		<div style={{height: "600px", display: "flex"}}>
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={GROUPS}
				variant="tree"
				showHome={false}
				showSearch={false}
				showMarketplace={false}
			/>
		</div>,
	);
	const noneRow = [...none.container.querySelectorAll("button")].find((b) =>
		b.textContent?.trim().startsWith("Notifications"),
	);
	// A zero badge claims something needs attention when nothing does.
	expect(noneRow?.textContent?.trim()).toBe("Notifications");

	const many = await render(
		<div style={{height: "600px", display: "flex"}}>
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={GROUPS}
				variant="tree"
				showHome={false}
				showSearch={false}
				showMarketplace={false}
				unreadNotifications={250}
			/>
		</div>,
	);
	const manyRow = [...many.container.querySelectorAll("button")].find((b) =>
		b.textContent?.trim().startsWith("Notifications"),
	);
	expect(manyRow?.textContent).toContain("99+");
	expect(manyRow?.textContent).not.toContain("250");
});

test("View all notifications fires its handler and closes the panel", async () => {
	let opened = 0;
	const s = await render(
		<div style={{height: "600px", display: "flex"}}>
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={GROUPS}
				variant="tree"
				showHome={false}
				showSearch={false}
				showMarketplace={false}
				unreadNotifications={2}
				onViewAllNotifications={() => {
					opened += 1;
				}}
			/>
		</div>,
	);
	await s.getByText("Notifications", {exact: true}).click();
	await settle();
	const action = [...document.querySelectorAll("[data-radix-popper-content-wrapper] button")].find(
		(b) => b.textContent?.trim() === "View all notifications",
	) as HTMLElement;
	expect(action, "the panel should offer a way out to the full surface").toBeTruthy();
	action.click();
	await settle();
	expect(opened).toBe(1);
	// Assert the PANEL is gone rather than the popper wrapper — a tooltip uses the same wrapper, and
	// Radix keeps it mounted through the close animation.
	await settle();
	expect(document.body.textContent).not.toContain("Deployment succeeded");
});

// The panel is a plain scrolling list now — the All / Projects / System tabs are gone, and it has a
// fixed height so the list scrolls at a predictable size rather than the panel growing to whatever
// the data happens to hold.
test("the notifications panel is a single scrolling list with no tabs", async () => {
	const s = await render(
		<div style={{height: "600px", display: "flex"}}>
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={GROUPS}
				variant="tree"
				showHome={false}
				showSearch={false}
				showMarketplace={false}
				unreadNotifications={2}
			/>
		</div>,
	);
	await s.getByText("Notifications", {exact: true}).click();
	await settle();
	const panel = document.querySelector("[data-radix-popper-content-wrapper]") as HTMLElement;
	expect(panel).toBeTruthy();
	for (const tab of ["All", "Projects", "System"]) {
		expect(
			[...panel.querySelectorAll("button")].some((b) => b.textContent?.trim() === tab),
			`"${tab}" tab should be gone`,
		).toBe(false);
	}
	// Fixed height, and more content than fits — so it genuinely scrolls.
	const scroller = panel.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement;
	expect(scroller).toBeTruthy();
	expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
});
