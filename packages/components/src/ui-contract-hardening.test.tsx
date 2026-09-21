import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {createThemedChartOption} from "./chart";
import {ContextToolbar} from "./context-toolbar";
import {PageContentHeader} from "./page-content-header";
import {ViewTabBar} from "./view-tab-bar";

test("chart semantic tones resolve CSS Color 4 tokens to canvas-safe RGB", () => {
	document.documentElement.style.setProperty("--success", "oklch(0.59 0.16 145)");
	const themed = createThemedChartOption({series: [{type: "line", data: [1, 2]}]}, [{tone: "success"}]);
	const series = (themed.series as Array<{lineStyle?: {color?: string}}>)[0];
	expect(series.lineStyle?.color).toMatch(/^rgba?\(/);
});

test("ViewTabBar is transparent by default and supports an explicit card surface", async () => {
	const props = {tabs: [{id: "overview", label: "Overview"}], activeTab: "overview", onTabChange: () => undefined};
	const {container, rerender} = await render(<ViewTabBar {...props} />);
	expect(container.querySelector('[data-wakecore-artifact="view-tab-bar"]')).toHaveAttribute(
		"data-wakecore-surface",
		"transparent",
	);
	await rerender(<ViewTabBar {...props} surface="card" />);
	expect(container.querySelector('[data-wakecore-artifact="view-tab-bar"]')).toHaveAttribute(
		"data-wakecore-surface",
		"card",
	);
});

test("ContextToolbar keeps actions accessible and moves excess actions to overflow", async () => {
	await render(
		<ContextToolbar
			title="Live map"
			maxVisibleActions={1}
			actions={[
				{id: "filter", label: "Filter", onSelect: () => undefined},
				{id: "export", label: "Export", onSelect: () => undefined},
			]}
		/>,
	);
	await expect.element(page.getByRole("button", {name: "Filter"})).toBeVisible();
	await expect.element(page.getByRole("button", {name: "More actions"})).toBeVisible();
	expect(document.querySelector('[data-wakecore-responsive-group="context-title"]')).not.toBeNull();
});

test("PageContentHeader composes navigation, action overflow, and split-primary controls", async () => {
	await render(
		<PageContentHeader
			variant="navigation"
			title="ASMobbin"
			tabs={[{id: "runs", label: "Runs"}]}
			activeTab="runs"
			onTabChange={() => undefined}
			actions={[
				{id: "permissions", label: "Permissions", onSelect: () => undefined},
				{id: "new", label: "New", onSelect: () => undefined, priority: "primary"},
			]}
			splitAction={{
				id: "start",
				label: "Start",
				onSelect: () => undefined,
				options: [{id: "template", label: "Start from template", onSelect: () => undefined}],
			}}
		/>,
	);
	await expect.element(page.getByRole("heading", {name: "ASMobbin"})).toBeVisible();
	await expect.element(page.getByRole("button", {name: "Runs"}).first()).toBeVisible();
	await expect.element(page.getByRole("button", {name: "New"})).toBeVisible();
	await expect.element(page.getByRole("button", {name: "Start options"})).toBeVisible();
	await expect.element(page.getByRole("button", {name: "More actions"})).toBeVisible();
	expect(document.querySelector('[data-wakecore-artifact="page-content-header"]')).not.toBeNull();
	expect(document.querySelector('[data-wakecore-responsive-group="identity"]')).not.toBeNull();
	expect(document.querySelector('[data-wakecore-responsive-group="actions"]')).not.toBeNull();
});
