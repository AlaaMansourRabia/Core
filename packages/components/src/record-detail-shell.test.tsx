import {useState} from "react";
import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {RecordDetailShell} from "./record-detail-shell";

const SECTIONS = [
	{
		items: [
			{id: "overview", label: "Overview"},
			{id: "properties", label: "Properties"},
			{id: "canvas", label: "Canvas"},
		],
	},
];

function Host({flushOnCanvas = false}: {flushOnCanvas?: boolean}) {
	const [section, setSection] = useState("overview");
	return (
		<RecordDetailShell
			title="Object type"
			sections={SECTIONS}
			activeSectionId={section}
			onSectionChange={setSection}
			flush={flushOnCanvas && section === "canvas"}
		>
			{section === "overview" && <p>Overview body</p>}
			{section === "properties" && <p>Properties body</p>}
			{section === "canvas" && <div data-canvas>Canvas body</div>}
		</RecordDetailShell>
	);
}

test("RecordDetailShell renders the rail and the active section", async () => {
	await render(<Host />);
	// SideMenu renders the heading twice — the desktop rail and the below-md row.
	await expect.element(page.getByText("Object type").first()).toBeVisible();
	await expect.element(page.getByText("Overview body")).toBeVisible();
	expect(document.body.textContent).not.toContain("Properties body");
});

test("RecordDetailShell switches sections from the rail", async () => {
	await render(<Host />);
	await page.getByText("Properties").click();
	await expect.element(page.getByText("Properties body")).toBeVisible();
});

test("RecordDetailShell scrolls the content column, not the page", async () => {
	const {container} = await render(<Host />);
	const row = container.querySelector("[data-wakecore-artifact='record-detail-shell']");
	// min-h-0 on the row is what lets the inner column scroll instead of growing the page.
	expect(row?.className).toContain("wwc:min-h-0");
	const scroller = row?.querySelector(".wwc\\:overflow-auto");
	expect(scroller).not.toBeNull();
	// The scroll owner must stay unpadded or the last section loses its bottom gutter.
	expect(scroller?.className).not.toContain("wwc:p-6");
});

test("RecordDetailShell places a flush section outside the padded well", async () => {
	const {container} = await render(<Host flushOnCanvas />);
	await page.getByText("Canvas").click();
	await expect.element(page.getByText("Canvas body")).toBeVisible();

	const canvas = container.querySelector("[data-canvas]");
	// Direct flex child of the row — no scrolling well between them.
	expect(canvas?.parentElement?.getAttribute("data-wakecore-artifact")).toBe("record-detail-shell");
});

test("RecordDetailShell keeps a non-flush section inside the padded well", async () => {
	const {container} = await render(<Host />);
	await page.getByText("Canvas").click();

	const canvas = container.querySelector("[data-canvas]");
	expect(canvas?.parentElement?.className).toContain("wwc:p-6");
});
