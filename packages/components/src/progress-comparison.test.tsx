import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page, userEvent} from "vitest/browser";

import {ProgressComparison, type ProgressComparisonStat} from "./progress-comparison";

const STATS: ProgressComparisonStat[] = [
	{label: "PV", value: "$160,604"},
	{label: "BAC", value: "$817,218"},
	{label: "SV", value: "-$27,821", negative: true},
	{label: "EV", value: "$184,262"},
];

test("renders header, hero values, and stats", async () => {
	await render(
		<ProgressComparison
			title="Ground Floor"
			subtitle="Floor | HOUSE-12-F0"
			primary={{label: "Approved", value: 67}}
			secondary={{label: "Planned", value: 71}}
			stats={STATS}
		/>,
	);
	await expect.element(page.getByText("Ground Floor")).toBeVisible();
	await expect.element(page.getByText("Floor | HOUSE-12-F0")).toBeVisible();
	await expect.element(page.getByText("67%")).toBeVisible();
	await expect.element(page.getByText("71%")).toBeVisible();
	await expect.element(page.getByText("$160,604")).toBeVisible();
	await expect.element(page.getByText("-$27,821")).toBeVisible();
});

test("computes variance from the two sources", async () => {
	await render(
		<ProgressComparison
			title="A"
			primary={{label: "Approved", value: 67}}
			secondary={{label: "Planned", value: 71}}
			stats={STATS}
		/>,
	);
	// 67 - 71 = -4
	await expect.element(page.getByText("-4%")).toBeVisible();
	await expect.element(page.getByText("variance")).toBeVisible();
});

test("progress variant shows the status chip", async () => {
	await render(
		<ProgressComparison
			title="A"
			variant="progress"
			status={{label: "In Progress"}}
			primary={{label: "Approved", value: 67}}
			secondary={{label: "Planned", value: 71}}
			stats={STATS}
		/>,
	);
	await expect.element(page.getByText("In Progress")).toBeVisible();
});

test("milestone variant renders the stepper title and milestone labels", async () => {
	await render(
		<ProgressComparison
			title="A"
			variant="milestone"
			status={{label: "M65"}}
			primary={{label: "Approved", value: 67}}
			secondary={{label: "Planned", value: 71}}
			milestones={[
				{date: "Jan-27", label: "M35", complete: true},
				{date: "Mar-27", label: "M80", marker: 80},
				{date: "Dec-27", label: "M100", flag: true},
			]}
			stats={STATS}
		/>,
	);
	await expect.element(page.getByText("Milestones")).toBeVisible();
	await expect.element(page.getByText("M35")).toBeVisible();
	await expect.element(page.getByText("M100")).toBeVisible();
});

test("fires onClose when the collapse button is clicked", async () => {
	const onClose = vi.fn();
	await render(
		<ProgressComparison
			title="A"
			onClose={onClose}
			primary={{label: "Approved", value: 67}}
			secondary={{label: "Planned", value: 71}}
			stats={STATS}
		/>,
	);
	await userEvent.click(page.getByRole("button", {name: "Collapse"}));
	expect(onClose).toHaveBeenCalledOnce();
});

test("collapsible button minimizes and restores the panel body", async () => {
	await render(
		<ProgressComparison
			title="A"
			collapsible
			primary={{label: "Approved", value: 67}}
			secondary={{label: "Planned", value: 71}}
			stats={STATS}
		/>,
	);
	// Body visible initially.
	await expect.element(page.getByText("$160,604")).toBeVisible();
	// Collapse hides the body.
	await userEvent.click(page.getByRole("button", {name: "Collapse"}));
	await expect.element(page.getByText("$160,604")).not.toBeInTheDocument();
	// Expand restores it.
	await userEvent.click(page.getByRole("button", {name: "Expand"}));
	await expect.element(page.getByText("$160,604")).toBeVisible();
});

test("preview variant renders the image, action button, and fires onClick", async () => {
	const onClick = vi.fn();
	await render(
		<ProgressComparison
			title="A"
			variant="preview"
			image={<img alt="Floor plan" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" />}
			action={{label: "View Walkthrough", onClick}}
			primary={{label: "Approved", value: 67}}
			secondary={{label: "Planned", value: 71}}
			stats={STATS}
		/>,
	);
	await expect.element(page.getByRole("img", {name: "Floor plan"})).toBeVisible();
	const btn = page.getByRole("button", {name: /View Walkthrough/});
	await expect.element(btn).toBeVisible();
	await userEvent.click(btn);
	expect(onClick).toHaveBeenCalledOnce();
});

test("no header button unless onClose or collapsible is set", async () => {
	await render(
		<ProgressComparison
			title="A"
			primary={{label: "Approved", value: 67}}
			secondary={{label: "Planned", value: 71}}
			stats={STATS}
		/>,
	);
	await expect.element(page.getByRole("button", {name: "Collapse"})).not.toBeInTheDocument();
});
