import {FileText, Folder, FolderTree} from "lucide-react";
import {afterEach, expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {CoreAppSidebar, type CoreAppSidebarProps, type SidebarNavGroup} from "./core-app-sidebar";

afterEach(() => {
	document.documentElement.removeAttribute("dir");
});

// WC-GAP-01 — the nav list is wrapped in a Radix ScrollArea, which stamps an explicit `dir` on its root
// and falls back to "ltr" when it finds neither a `dir` prop nor a DirectionProvider. That hard "ltr"
// halts inheritance of an RTL host's direction, pinning the nav LTR while the rest of the shell mirrors.
// The sidebar now threads the document direction through, so the nav viewport follows the host.
test("nav ScrollArea viewport follows an RTL document (WC-GAP-01)", async () => {
	document.documentElement.setAttribute("dir", "rtl");
	const {container} = await render(<CoreAppSidebar viewLevel="org" />);
	const viewport = container.querySelector("[data-radix-scroll-area-viewport]");
	expect(viewport).not.toBeNull();
	expect(getComputedStyle(viewport as Element).direction).toBe("rtl");
});

test("nav ScrollArea viewport stays LTR in an LTR document (WC-GAP-01)", async () => {
	document.documentElement.setAttribute("dir", "ltr");
	const {container} = await render(<CoreAppSidebar viewLevel="org" />);
	const viewport = container.querySelector("[data-radix-scroll-area-viewport]");
	expect(viewport).not.toBeNull();
	expect(getComputedStyle(viewport as Element).direction).toBe("ltr");
});

// WC-GAP-02 — the group-label caption is 10px ("small text"), so WCAG 1.4.3 wants >= 4.5:1. The old
// `text-muted-foreground/40` measured ~1.69:1; the caption now uses full-opacity `--muted-foreground`.
test("nav group-label caption uses full-opacity muted-foreground (WC-GAP-02)", async () => {
	await render(<CoreAppSidebar viewLevel="org" />);
	const label = page.getByText("Monitoring", {exact: true});
	await expect.element(label).toBeVisible();
	const header = label.element().parentElement;
	expect(header?.className).toContain("wwc:text-muted-foreground");
	expect(header?.className).not.toContain("wwc:text-muted-foreground/40");
});

// WC-GAP-04 — `onNavigate` reports only the label; `onNavigateItem` carries the item itself, so a
// consumer can track selection by the stable `id` instead of reverse-mapping the label.
test("onNavigateItem reports the selected item so consumers get its id (WC-GAP-04)", async () => {
	const seen: {id: string; label: string}[] = [];
	await render(
		<CoreAppSidebar viewLevel="org" onNavigateItem={(item) => seen.push({id: item.id, label: item.label})} />,
	);
	const overview = page.getByText("Overview", {exact: true});
	await expect.element(overview).toBeVisible();
	await overview.click();
	expect(seen.at(-1)).toEqual({id: "org-overview", label: "Overview"});
});

// WC-GAP-03 — the sidebar's built-in copy and aria-labels are overridable via `labels`, so a localized
// (e.g. RTL/Arabic) host can translate them. Keys left unset keep their English defaults.
test("labels override the sidebar's built-in copy (WC-GAP-03)", async () => {
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			labels={{collapseGroup: (g) => `اطو ${g}`, collapseSidebar: "طي الشريط الجانبي"}}
		/>,
	);
	expect(container.querySelector('button[aria-label="اطو Design"]')).not.toBeNull();
	expect(container.querySelector('button[aria-label="طي الشريط الجانبي"]')).not.toBeNull();
});

// ─── variant: "list" | "tree" ─────────────────────────────────────────────────
//
// The tree shape used to exist only as a hand-assembled set of chrome props at one call site (the
// WC3 workspace derived `showGroupDividers` and `groupsCollapsedByDefault` from a local boolean), so
// nothing named the shape and every other consumer had to rediscover the combination. `variant` names
// it on the widget. It supplies DEFAULTS only — an explicit prop still wins — and it deliberately does
// not touch `showSearch`, which is orthogonal chrome either shape may want.

const VARIANT_GROUPS: SidebarNavGroup[] = [
	{
		id: "design",
		label: "Design",
		icon: Folder,
		collapsible: true,
		items: [{id: "d1", label: "Blueprints", icon: FileText}],
	},
	{id: "plan", label: "Plan", icon: Folder, collapsible: true, items: [{id: "p1", label: "Schedule", icon: FileText}]},
];

const renderVariant = (props: Partial<CoreAppSidebarProps> = {}) =>
	render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			showHome={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
			{...props}
		/>,
	);

// Counting the DIFFERENCE rather than an absolute, so the assertion survives any other rule the shell
// draws (the pinned entry's, the footer's): the only separator the two shapes disagree about is the
// one between the two consecutive groups.
const rules = (container: Element) => container.querySelectorAll('[data-orientation="horizontal"]').length;

test('variant="tree" drops the rules between groups; "list" keeps them', async () => {
	const list = await renderVariant({variant: "list"});
	const tree = await renderVariant({variant: "tree"});
	expect(rules(list.container)).toBe(rules(tree.container) + 1);
});

test('variant defaults to "list", so existing consumers are unaffected', async () => {
	const explicit = await renderVariant({variant: "list"});
	const omitted = await renderVariant();
	expect(rules(omitted.container)).toBe(rules(explicit.container));
	for (const chevron of omitted.container.querySelectorAll("[aria-expanded]")) {
		expect(chevron.getAttribute("aria-expanded")).toBe("true");
	}
});

test('variant="tree" opens with every collapsible group folded', async () => {
	const {container} = await renderVariant({variant: "tree"});
	const chevrons = container.querySelectorAll("[aria-expanded]");
	expect(chevrons.length).toBe(VARIANT_GROUPS.length);
	for (const chevron of chevrons) {
		expect(chevron.getAttribute("aria-expanded")).toBe("false");
	}
});

test("an explicit prop overrides the variant's default", async () => {
	// The tree shape, but the caller wants its groups open and its rules back.
	const {container} = await renderVariant({
		variant: "tree",
		groupsCollapsedByDefault: false,
		showGroupDividers: true,
	});
	for (const chevron of container.querySelectorAll("[aria-expanded]")) {
		expect(chevron.getAttribute("aria-expanded")).toBe("true");
	}
	const plainTree = await renderVariant({variant: "tree"});
	expect(rules(container)).toBe(rules(plainTree.container) + 1);
});

const hasRow = (container: Element, label: string) =>
	[...container.querySelectorAll("button")].some((b) => b.textContent?.trim() === label);

test("variant leaves showSearch alone — search is its own prop in both shapes", async () => {
	const treeNoSearch = await renderVariant({variant: "tree", showSearch: false});
	expect(hasRow(treeNoSearch.container, "Search")).toBe(false);
	const treeWithSearch = await renderVariant({variant: "tree", showSearch: true});
	expect(hasRow(treeWithSearch.container, "Search")).toBe(true);
	const listWithSearch = await renderVariant({variant: "list", showSearch: true});
	expect(hasRow(listWithSearch.container, "Search")).toBe(true);
});

// The group header used to carry TWO targets — the name opened a page about the group, the chevron
// folded it. The name is no longer a link: the whole header folds, nothing underlines, and no gesture
// in the expanded nav reports a group. `activeGroupId` still marks the active section, as weight and
// colour rather than a rule under the name.
test("clicking a group NAME folds the group, the same as its chevron", async () => {
	const onGroupSelect = vi.fn();
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="list"
			showHome={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
			onGroupSelect={onGroupSelect}
		/>,
	);
	const header = container.querySelector("[aria-expanded]") as HTMLElement;
	expect(header.getAttribute("aria-expanded")).toBe("true");
	// The NAME, not the chevron — the text node's own element, to prove the label itself is the target.
	const name = page.getByText("Design", {exact: true});
	await name.click();
	expect(header.getAttribute("aria-expanded")).toBe("false");
	await name.click();
	expect(header.getAttribute("aria-expanded")).toBe("true");
	// Folding is not navigating: the header reports nothing.
	expect(onGroupSelect).not.toHaveBeenCalled();
});

test("no group name underlines — neither on hover nor while active", async () => {
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			activeGroupId="design"
			showHome={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	for (const header of container.querySelectorAll("[aria-expanded]")) {
		expect(header.className).not.toContain("underline");
		for (const el of header.querySelectorAll("*")) {
			expect(el.className.toString()).not.toContain("underline");
		}
	}
	// The active group is still marked, just not with a rule under its name.
	const active = container.querySelector('[aria-expanded][class*="text-foreground"]');
	expect(active).not.toBeNull();
});

test("the header is ONE focus stop, not a name plus a chevron", async () => {
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			showHome={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	// One button per group header, and the chevron inside it is decoration.
	for (const header of container.querySelectorAll("[aria-expanded]")) {
		expect(header.tagName).toBe("BUTTON");
		expect(header.querySelectorAll("button").length).toBe(0);
	}
});

// Files and Home used to be divided from EACH OTHER — a rule between them, and a second one under
// Home. They are now one pinned block: both sit above a single rule, because both stand outside the
// app hierarchy below rather than being separate sections from one another.
test("the pinned entry and Home sit together above one rule", async () => {
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			pinnedTop={{id: "files", label: "Files", icon: FolderTree}}
			showHome
			showHomeDivider={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	// Walk the nav in document order and record where the rows and rules fall.
	const nav = container.querySelector("[data-radix-scroll-area-viewport]") as Element;
	const marks: string[] = [];
	for (const el of nav.querySelectorAll('button, [data-orientation="horizontal"]')) {
		const text = el.textContent?.trim();
		if (el.getAttribute("data-orientation") === "horizontal") marks.push("—");
		else if (text === "Files") marks.push("Files");
		else if (text === "Home") marks.push("Home");
		else if (text?.startsWith("Design")) marks.push("Design");
	}
	// Files, then Home, then the rule, then the first group — no rule between Files and Home.
	expect(marks.slice(0, 4)).toEqual(["Files", "Home", "—", "Design"]);
});

test("Home alone above the groups still honours showHomeDivider", async () => {
	const withRule = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			showHome
			showHomeDivider
			showSearch={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	const withoutRule = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			showHome
			showHomeDivider={false}
			showSearch={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	expect(rules(withRule.container)).toBe(rules(withoutRule.container) + 1);
});

// A group that starts folded via `groupsCollapsedByDefault` is ABSENT from the collapsed-groups map
// until the user touches it, so the toggle used to negate `undefined` — writing "folded" over a group
// that was already folded, and costing a second click to open it. Only ever visible under a
// collapsed-by-default nav, which is exactly the tree variant, so the list-variant test above missed
// it. One click, both ways, from either starting state.
test("ONE click opens a group that starts folded by default", async () => {
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			showHome={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	const header = container.querySelector("[aria-expanded]") as HTMLElement;
	expect(header.getAttribute("aria-expanded")).toBe("false");
	const name = page.getByText("Design", {exact: true});
	await name.click();
	expect(header.getAttribute("aria-expanded")).toBe("true");
	await name.click();
	expect(header.getAttribute("aria-expanded")).toBe("false");
	await name.click();
	expect(header.getAttribute("aria-expanded")).toBe("true");
});

test("ONE click folds a group that starts open by default", async () => {
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			groupsCollapsedByDefault={false}
			showHome={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	const header = container.querySelector("[aria-expanded]") as HTMLElement;
	expect(header.getAttribute("aria-expanded")).toBe("true");
	await page.getByText("Design", {exact: true}).click();
	expect(header.getAttribute("aria-expanded")).toBe("false");
});

// `variant` and `density` are separate axes — the variant sets the SHAPE of the nav, density sets how
// tightly it packs — so every combination has to hold. The compact tree keeps the tree's behaviour
// (groups folded, no rules between them) while swapping in the compact metrics.
test('variant="tree" composes with density="compact"', async () => {
	const compact = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			density="compact"
			showHome={false}
			showSearch={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	const comfortable = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			density="comfortable"
			showHome={false}
			showSearch={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	// Shape is the variant's, at both densities: every group folded, and no rule between them.
	for (const {container} of [compact, comfortable]) {
		const chevrons = container.querySelectorAll("[aria-expanded]");
		expect(chevrons.length).toBe(VARIANT_GROUPS.length);
		for (const c of chevrons) expect(c.getAttribute("aria-expanded")).toBe("false");
	}
	expect(rules(compact.container)).toBe(rules(comfortable.container));
	// Metrics are the density's: the compact tree pulls its spine indent in from 28px to 22px.
	expect(compact.container.innerHTML).toContain("pl-[22px]");
	expect(comfortable.container.innerHTML).toContain("pl-[28px]");
});

test("the pinned block follows the density too", async () => {
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			density="compact"
			pinnedTop={{id: "files", label: "Files", icon: FolderTree}}
			showHome
			showSearch
			showMarketplace={false}
			showFooter={false}
		/>,
	);
	// All four shell surfaces present at compact density — notifications used to be suppressed here.
	for (const label of ["Search", "Files", "Home", "Notifications"]) {
		expect(hasRow(container, label)).toBe(true);
	}
	expect(container.innerHTML).toContain("text-[12px]");
});

// The group icon earns its place in the expanded header as well as the rail: once the sidebar
// collapses, the icon is the ONLY thing left standing for the group, so showing it beside the name
// expanded is what teaches which icon means which section. Both densities, at their own icon size.
test("a tree group shows its icon beside the name, at both densities", async () => {
	for (const [density, size] of [
		["comfortable", "h-[15px]"],
		["compact", "h-[14px]"],
	] as const) {
		const {container} = await render(
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={VARIANT_GROUPS}
				variant="tree"
				density={density}
				showHome={false}
				showSearch={false}
				showMarketplace={false}
				showNotifications={false}
				showFooter={false}
			/>,
		);
		const headers = container.querySelectorAll("[aria-expanded]");
		expect(headers.length).toBe(VARIANT_GROUPS.length);
		for (const header of headers) {
			const svgs = header.querySelectorAll("svg");
			// The group icon, then the fold chevron — the icon leads the row.
			expect(svgs.length).toBe(2);
			expect(svgs[0].getAttribute("class")).toContain(size);
			// It precedes the label rather than trailing it.
			const label = header.querySelector("span");
			expect(svgs[0].compareDocumentPosition(label as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		}
	}
});

// The rail is why the icon is required: collapsed, each tree group is that icon and nothing else.
test("the collapsed rail still shows one icon per group", async () => {
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			collapsed
			showHome={false}
			showSearch={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	// No group labels survive the collapse — only their icons stand in for them.
	for (const g of VARIANT_GROUPS) {
		expect(hasRow(container, g.label as string)).toBe(false);
	}
	expect(container.querySelectorAll("button svg").length).toBeGreaterThanOrEqual(VARIANT_GROUPS.length);
});

// The pinned block sits BETWEEN the two densities at compact: bigger than the nav rows it stands over,
// smaller than the comfortable rows. Its horizontal padding deliberately matches the nav rows so the
// icon column still lines up.
test("compact pinned rows are sized between the two densities", async () => {
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			density="compact"
			pinnedTop={{id: "files", label: "Files", icon: FolderTree}}
			showHome
			showSearch
			showMarketplace={false}
			showFooter={false}
		/>,
	);
	const pinned = [...container.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Files");
	expect(pinned).toBeDefined();
	// Between compact's py-1/text-[12px] and comfortable's py-[7px]/text-[13px].
	expect(pinned?.className).toContain("py-[6px]");
	expect(pinned?.className).toContain("text-[12.5px]");
	// Same horizontal padding as the group rows, so the icons share one column.
	expect(pinned?.className).toContain("px-2");
	// By label, not by `[aria-expanded]` — the Notifications popover trigger carries that attribute too.
	const header = [...container.querySelectorAll("[aria-expanded]")].find((b) => b.textContent?.trim() === "Design");
	expect(header).toBeDefined();
	expect(header?.className).toContain("px-2");
	// And the pinned icon is a notch bigger than the group icon.
	expect(pinned?.querySelector("svg")?.getAttribute("class")).toContain("h-[15px]");
	expect(header?.querySelector("svg")?.getAttribute("class")).toContain("h-[14px]");
});

test("comfortable pinned rows stay exactly at row size", async () => {
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			density="comfortable"
			pinnedTop={{id: "files", label: "Files", icon: FolderTree}}
			showHome
			showMarketplace={false}
			showFooter={false}
		/>,
	);
	const pinned = [...container.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Files");
	expect(pinned?.className).toContain("py-[7px]");
	expect(pinned?.className).toContain("text-[13px]");
});

// Compact used to stack its rows flush (`space-y-0`), which read as one solid block rather than a
// list of destinations. Rows now carry a small gap at both densities, and the pinned block — whose
// rows are the taller ones — carries a proportionally bigger one, so it breathes a little more than
// the groups beneath it.
test("compact rows are not flush, and the pinned block breathes more than the groups", async () => {
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			density="compact"
			groupsCollapsedByDefault={false}
			pinnedTop={{id: "files", label: "Files", icon: FolderTree}}
			showHome
			showSearch
			showMarketplace={false}
			showFooter={false}
		/>,
	);
	// Each item sits in its own wrapper (the elbow is drawn off it), so walk up to whichever ancestor
	// actually carries the row gap rather than assuming it is the immediate parent.
	const gapOwner = (label: string) => {
		let el = [...container.querySelectorAll("button")].find((b) => b.textContent?.trim() === label)?.parentElement;
		while (el && !/space-y-/.test(el.className)) el = el.parentElement;
		return el?.className ?? "";
	};
	expect(gapOwner("Files")).toContain("space-y-1");
	// A group's items wrapper takes the ordinary row gap — present, but smaller than the block above.
	expect(gapOwner("Blueprints")).toContain("space-y-0.5");
});

// Folded, a group IS one header row, so groups stacking flush read as a solid block — the same
// problem the rows had. Groups now carry a gap of their own, except where a rule already separates
// them (the rule brings its own margins, and stacking both opens a gulf).
test("groups get a gap of their own, and not on top of a rule", async () => {
	const groups: SidebarNavGroup[] = [
		...VARIANT_GROUPS,
		{
			id: "studio",
			label: "Studio",
			icon: Folder,
			collapsible: true,
			dividerBefore: true,
			items: [{id: "s1", label: "Analysis", icon: FileText}],
		},
	];
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={groups}
			variant="tree"
			density="compact"
			showHome={false}
			showSearch={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	const wrapperFor = (label: string) => {
		const header = [...container.querySelectorAll("[aria-expanded]")].find((b) => b.textContent?.trim() === label);
		// Guard: without this a label that is not in the fixture returns "" and every `not.toContain`
		// below passes vacuously.
		expect(header, `no group header labelled "${label}"`).toBeDefined();
		let el = header?.parentElement;
		while (el && !/wwc:relative/.test(el.className)) el = el.parentElement;
		expect(el, `no positioned wrapper above "${label}"`).toBeTruthy();
		return el?.className ?? "";
	};
	// First group: nothing above it, so no gap.
	expect(wrapperFor("Design")).not.toContain("mt-1");
	// A middle group: a gap, and no rule.
	expect(wrapperFor("Plan")).toContain("mt-1");
	// Studio asks for a rule, so it takes the rule's margins instead of the gap.
	expect(wrapperFor("Studio")).not.toContain("mt-1");
});

// A tinted item wears the file system's soft-tint formula in a rounded chip, the way a file row wears
// its type's. The tint owns the icon's colour, so the chip must NOT also carry the row's muted/hover
// foreground — that would wash the hue out exactly when the reader points at it.
test("a toned item renders its icon in a tinted chip, untouched by the row's hover colour", async () => {
	const TONE = "wwc:bg-blue-500/10 wwc:text-blue-700 wwc:dark:text-blue-400";
	const toned: SidebarNavGroup[] = [
		{
			id: "design",
			label: "Design",
			icon: Folder,
			collapsible: true,
			items: [
				{id: "d1", label: "Blueprints", icon: FileText, tone: TONE},
				{id: "d2", label: "Plain", icon: FileText},
			],
		},
	];
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={toned}
			variant="tree"
			groupsCollapsedByDefault={false}
			showHome={false}
			showSearch={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	const row = (label: string) => [...container.querySelectorAll("button")].find((b) => b.textContent?.trim() === label);

	const chip = row("Blueprints")?.querySelector('[class*="bg-blue-500/10"]');
	expect(chip, "toned item should carry a tinted chip").toBeTruthy();
	expect(chip?.className).toContain("rounded-md");
	expect(chip?.className).not.toContain("text-muted-foreground");
	expect(chip?.className).not.toContain("group-hover:text-foreground");

	// An untinted item in the same group keeps the plain muted icon every nav row has always had.
	const plainIcon = row("Plain")?.querySelector("svg");
	expect(plainIcon?.getAttribute("class")).toContain("text-muted-foreground");
	expect(row("Plain")?.querySelector('[class*="bg-blue-500/10"]')).toBeNull();
});

// V3's stages are tinted; V2's flat "Your apps" list is not — with no stages to tell apart, a hue
// there would carry no meaning. Within a stage the tones come from the shared palette in hand-out
// order, whose whole purpose is that adjacent picks are never neighbouring hues.
test("apps in a stage take distinct, non-adjacent hues", async () => {
	const {lifecycleAppGroups, installedAppsGroup, APPS} = await import("../pages/app-marketplace-shared");
	const {TONES} = await import("../tones");
	const installed = APPS.filter((a) => ["progress", "analytics", "ai-reports", "weather"].includes(a.id));
	const [plan] = lifecycleAppGroups(installed, new Set());
	expect(plan.items.length).toBeGreaterThan(2);
	// No repeats, and every tone is one the palette actually publishes.
	const tones = plan.items.map((i) => i.tone);
	expect(new Set(tones).size).toBe(tones.length);
	const chips = new Set(TONES.map((t) => t.chip));
	for (const t of tones) expect(chips.has(t as string)).toBe(true);
	// Consecutive rows never share a colour family, so no two neighbours read as the same hue.
	const familyOf = (chip: string) => /wwc:bg-([a-z]+)-500/.exec(chip)?.[1];
	for (let i = 1; i < tones.length; i++) {
		expect(familyOf(tones[i - 1] as string)).not.toBe(familyOf(tones[i] as string));
	}
	// The V2 shape stays plain.
	const [flat] = installedAppsGroup(installed, new Set());
	expect(flat.items.every((i) => i.tone === undefined)).toBe(true);
});

// Collapsing the sidebar must not change what an app looks like: the flyout behind a group icon shows
// the same tinted chips the expanded nav does, or the colour stops being an identity and becomes
// decoration that only exists at one width.
test("the collapsed rail's flyout carries the same tints", async () => {
	const TONE = "wwc:bg-blue-500/10 wwc:text-blue-700 wwc:dark:text-blue-400";
	const toned: SidebarNavGroup[] = [
		{
			id: "design",
			label: "Design",
			icon: Folder,
			collapsible: true,
			items: [{id: "d1", label: "Blueprints", icon: FileText, tone: TONE}],
		},
	];
	const screen = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={toned}
			variant="tree"
			collapsed
			showHome={false}
			showSearch={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	// The group is one icon in the rail; its items live behind it.
	await screen.getByLabelText("Design").click();
	// The flyout is portalled out of `container`, and `data-rail-flyout` marks the TRIGGER, not the
	// panel — so look for the row itself in the document.
	const row = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Blueprints");
	expect(row, "flyout should list the group's items").toBeTruthy();
	const chip = row?.querySelector('[class*="bg-blue-500/10"]');
	expect(chip, "flyout row should carry the item's tint").toBeTruthy();
	expect(chip?.className).toContain("rounded-md");
});

// Toggling the sidebar used to resize the brand: h-5 expanded, the nav icon size collapsed — and the
// collapsed rule also pinned an explicit width, squashing a mark that is wider than it is tall. One
// size now, `w-auto` in both, so the logo holds still while everything around it moves.
test("the WakeCap mark keeps one size and its aspect across collapse", async () => {
	const markIn = (root: Element) => {
		const svg = [...root.querySelectorAll("svg")].find((el) => /h-\[18px\]/.test(el.getAttribute("class") ?? ""));
		return svg?.getAttribute("class") ?? "";
	};
	const expanded = await render(<CoreAppSidebar viewLevel="org" orgGroups={VARIANT_GROUPS} showFooter={false} />);
	const collapsed = await render(
		<CoreAppSidebar viewLevel="org" orgGroups={VARIANT_GROUPS} collapsed showFooter={false} />,
	);
	const a = markIn(expanded.container);
	const b = markIn(collapsed.container);
	expect(a, "expanded should render the brand mark").toContain("h-[18px]");
	expect(b, "collapsed should render the brand mark").toContain("h-[18px]");
	// Aspect preserved in both: no explicit width pinning the mark into a square.
	expect(a).toContain("w-auto");
	expect(b).toContain("w-auto");
	expect(b).not.toMatch(/w-\[\d+px\]/);
});

test("the mark tracks density, but still matches itself across collapse", async () => {
	// Compact draws the mark a touch smaller — at the 14px its nav icons use — in BOTH states.
	const markIn = (root: Element) => {
		const svg = [...root.querySelectorAll("svg")].find((el) => /h-\[14px\]/.test(el.getAttribute("class") ?? ""));
		return svg?.getAttribute("class") ?? "";
	};
	const expanded = await render(
		<CoreAppSidebar viewLevel="org" orgGroups={VARIANT_GROUPS} density="compact" showFooter={false} />,
	);
	const collapsed = await render(
		<CoreAppSidebar viewLevel="org" orgGroups={VARIANT_GROUPS} density="compact" collapsed showFooter={false} />,
	);
	expect(markIn(expanded.container)).toContain("h-[14px]");
	expect(markIn(collapsed.container)).toContain("h-[14px]");
	expect(markIn(expanded.container)).toContain("w-auto");
	expect(markIn(collapsed.container)).toContain("w-auto");
});

// The chevron used to be pinned to the far right of the header and pointed up/down. It now sits
// directly beside the group name, and points the way the disclosure actually reads: right while shut
// (open me to reveal what is inside), down while open.
test("the group chevron sits beside the name and points right when shut, down when open", async () => {
	const {container} = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			showHome={false}
			showSearch={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	const header = [...container.querySelectorAll("[aria-expanded]")].find(
		(b) => b.textContent?.trim() === "Design",
	) as HTMLElement;
	expect(header.getAttribute("aria-expanded")).toBe("false");
	expect(header.querySelector(".lucide-chevron-right")).not.toBeNull();
	expect(header.querySelector(".lucide-chevron-down")).toBeNull();

	// Beside the name, not at the far edge: label and chevron are siblings inside one pair that has a
	// tighter gap than the row's, and the flexible spacer that fills the row comes AFTER the pair.
	const pair = [...header.children].find((el) => el.querySelector(".lucide-chevron-right")) as HTMLElement;
	expect(pair, "label and chevron should share a wrapper").toBeTruthy();
	expect(pair.className).toContain("gap-0.5");
	const inner = [...pair.children];
	const labelIdx = inner.findIndex((el) => el.textContent?.trim() === "Design");
	const chevronIdx = inner.findIndex((el) => el.querySelector(".lucide-chevron-right"));
	expect(chevronIdx).toBe(labelIdx + 1);
	expect(inner[labelIdx].className).not.toContain("flex-1");
	// The pair's gap must be tighter than the row gap it would otherwise have inherited.
	expect(header.className).toMatch(/gap-[23]\b/);
	// `getAttribute`, not `className`: an <svg> child exposes an SVGAnimatedString there, which has no
	// string methods (the old regex only worked because `test()` coerces).
	const spacerIdx = [...header.children].findIndex((el) =>
		(el.getAttribute("class") ?? "").trim().endsWith("wwc:flex-1"),
	);
	expect(spacerIdx).toBeGreaterThan([...header.children].indexOf(pair));

	await page.getByText("Design", {exact: true}).click();
	expect(header.getAttribute("aria-expanded")).toBe("true");
	expect(header.querySelector(".lucide-chevron-down")).not.toBeNull();
	expect(header.querySelector(".lucide-chevron-right")).toBeNull();
});

// Both panels float over the rail rather than sitting on it, so they take the library's shallow
// FLOAT_SHADOW — and, because `cn` runs tailwind-merge, that must actually REPLACE the Popover base's
// heavier `shadow-md` rather than landing beside it and losing to source order.
test("the rail flyout and the notifications panel float on the shallow shadow", async () => {
	const {FLOAT_SHADOW} = await import("../float-shadow");
	const shadowClass = FLOAT_SHADOW.replace(/^wwc:/, "");

	const rail = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			collapsed
			showHome={false}
			showSearch={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	await rail.getByLabelText("Design").click();
	const flyout = [...document.querySelectorAll("[data-radix-popper-content-wrapper] *")].find((el) =>
		el.className?.toString().includes("w-[220px]"),
	);
	expect(flyout, "the group flyout should be open").toBeTruthy();
	expect(flyout?.className).toContain(shadowClass);
	expect(flyout?.className).not.toContain("shadow-md");

	const bell = await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={VARIANT_GROUPS}
			variant="tree"
			showHome={false}
			showSearch={false}
			showMarketplace={false}
			showFooter={false}
		/>,
	);
	await bell.getByText("Notifications", {exact: true}).click();
	const panel = [...document.querySelectorAll("[data-radix-popper-content-wrapper] *")].find((el) =>
		el.className?.toString().includes("w-[300px]"),
	);
	expect(panel, "the notifications panel should be open").toBeTruthy();
	expect(panel?.className).toContain(shadowClass);
	expect(panel?.className).not.toContain("shadow-md");
});

// Clicking straight from one group's rail icon to another's must SWITCH flyouts on that one click.
// One piece of state serves every flyout, so the two overlap during a switch: the new flyout claims
// the slot on click, and the old one is dismissed a moment later when focus lands outside it. An
// unconditional clear on that dismissal wiped the claim the click had just made, and the switch cost
// two clicks — the first spent closing, the second reopening.
test("clicking another group's rail icon switches flyouts in ONE click", async () => {
	const groups: SidebarNavGroup[] = [
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
	await render(
		<CoreAppSidebar
			viewLevel="org"
			orgGroups={groups}
			variant="tree"
			collapsed
			showHome={false}
			showSearch={false}
			showMarketplace={false}
			showNotifications={false}
			showFooter={false}
		/>,
	);
	const railIcon = (label: string) =>
		[...document.querySelectorAll("[data-rail-flyout]")].find(
			(b) => b.getAttribute("aria-label") === label,
		) as HTMLElement;
	const openFlyout = () =>
		[...document.querySelectorAll("[data-radix-popper-content-wrapper] button")]
			.map((b) => b.textContent?.trim())
			.join(",");
	// Focus moves to a button on press in a real browser, which is what fires the OLD flyout's
	// dismissal — reproduce that ordering rather than only the click.
	const press = async (el: HTMLElement) => {
		el.dispatchEvent(new PointerEvent("pointerdown", {bubbles: true, cancelable: true}));
		el.focus();
		el.dispatchEvent(new PointerEvent("pointerup", {bubbles: true, cancelable: true}));
		el.click();
		await new Promise((r) => setTimeout(r, 60));
	};

	await press(railIcon("Design"));
	expect(openFlyout()).toContain("Blueprints");

	await press(railIcon("Plan"));
	expect(openFlyout(), "one click on another group should switch, not just close").toContain("Schedule");
	expect(openFlyout()).not.toContain("Blueprints");

	// And clicking the OPEN group's own icon still closes it.
	await press(railIcon("Plan"));
	expect(openFlyout()).toBe("");
});
