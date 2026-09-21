import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {AssetListItem} from "./asset-list-item";

test("AssetListItem renders the thumbnail, title, subtitle and meta line", async () => {
	await render(
		<AssetListItem
			thumbnail="https://example.test/frame.jpg"
			thumbnailAlt="Tower crane east"
			title="Tower crane east"
			subtitle="Zone B · Level 12"
		>
			<span>2 min ago</span>
		</AssetListItem>,
	);
	await expect.element(page.getByRole("img", {name: "Tower crane east"})).toBeVisible();
	await expect.element(page.getByText("Zone B · Level 12")).toBeVisible();
	await expect.element(page.getByText("2 min ago")).toBeVisible();
});

test("AssetListItem shows the fallback when there is no thumbnail", async () => {
	const {container} = await render(<AssetListItem fallback={<span data-fallback>offline</span>} title="Gate camera" />);
	expect(container.querySelector("img")).toBeNull();
	expect(container.querySelector("[data-fallback]")).not.toBeNull();
});

test("AssetListItem marks selection in the DOM as well as the ring", async () => {
	const {container} = await render(<AssetListItem title="Gate camera" selected />);
	const card = container.querySelector("[data-wakecore-artifact='asset-list-item']");
	expect(card?.getAttribute("data-selected")).toBe("true");
	expect(card?.className).toContain("wwc:ring-2");
});

test("AssetListItem is unselected by default", async () => {
	const {container} = await render(<AssetListItem title="Gate camera" />);
	const card = container.querySelector("[data-wakecore-artifact='asset-list-item']");
	expect(card?.getAttribute("data-selected")).toBeNull();
	expect(card?.className).not.toContain("wwc:ring-2");
});

test("AssetListItem calls onClick", async () => {
	const onClick = vi.fn();
	await render(<AssetListItem title="Gate camera" onClick={onClick} />);
	await page.getByText("Gate camera").click();
	expect(onClick).toHaveBeenCalledOnce();
});

test("AssetListItem renders an overlay over the thumbnail well", async () => {
	const {container} = await render(
		<AssetListItem thumbnail="x.jpg" thumbnailAlt="x" title="Timelapse" overlay={<span data-overlay>0:42</span>} />,
	);
	const overlay = container.querySelector("[data-overlay]");
	// Sibling of the img, inside the relatively-positioned thumbnail well.
	expect(overlay?.parentElement?.className).toContain("wwc:relative");
});
