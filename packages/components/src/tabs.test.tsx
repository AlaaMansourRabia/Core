import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page, userEvent} from "vitest/browser";

import {Tabs, TabsContent, TabsDropdownTrigger, TabsList, TabsTrigger} from "./tabs";

function Fixture({onSelect}: {onSelect?: (v: string) => void}) {
	return (
		<Tabs variant="underline" defaultValue="site">
			<TabsList>
				<TabsTrigger value="site">Site</TabsTrigger>
				<TabsDropdownTrigger
					value="reports"
					items={[
						{value: "milestone", label: "Milestone report"},
						{value: "weekly", label: "Weekly summary"},
					]}
					onSelect={onSelect}
				>
					Reports
				</TabsDropdownTrigger>
			</TabsList>
			<TabsContent value="site">Site view</TabsContent>
			<TabsContent value="reports">Reports view</TabsContent>
		</Tabs>
	);
}

test("Tabs shows the default tab's content", async () => {
	await render(<Fixture />);
	await expect.element(page.getByRole("tab", {name: "Site"})).toHaveAttribute("aria-selected", "true");
	await expect.element(page.getByText("Site view")).toBeVisible();
});

test("TabsDropdownTrigger renders as a tab", async () => {
	await render(<Fixture />);
	await expect.element(page.getByRole("tab", {name: /Reports/})).toBeVisible();
});

test("TabsDropdownTrigger reveals sub-views and selecting one fires onSelect", async () => {
	const onSelect = vi.fn();
	await render(<Fixture onSelect={onSelect} />);
	await userEvent.click(page.getByRole("tab", {name: /Reports/}).element());
	const item = page.getByRole("menuitem", {name: "Weekly summary"});
	await expect.element(item).toBeVisible();
	await userEvent.click(item.element());
	expect(onSelect).toHaveBeenCalledWith("weekly");
});
