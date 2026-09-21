import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {Minimap} from "./minimap";

test("Minimap renders the corner label", async () => {
	await render(<Minimap lon={46.6753} lat={24.7136} label="Site A" />);
	await expect.element(page.getByText("Site A")).toBeVisible();
});

test("Minimap renders a map image labelled from the site", async () => {
	await render(<Minimap lon={46.6753} lat={24.7136} label="Tower" />);
	await expect.element(page.getByRole("img", {name: "Tower location"})).toBeInTheDocument();
});

test("Minimap accepts a custom tile source", async () => {
	const {container} = await render(<Minimap lon={0} lat={0} src="https://example.com/tile.png" />);
	expect(container.querySelector("img")?.getAttribute("src")).toBe("https://example.com/tile.png");
});

test("Minimap renders the small size variant", async () => {
	const {container} = await render(<Minimap lon={0} lat={0} size="sm" />);
	expect(container.firstElementChild?.className).toContain("wwc:size-[140px]");
});
