import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {WalkthroughTile} from "./walkthrough-tile";

// A stable, tiny data-URI clip so the test never hits the network.
const SRC = "data:video/mp4;base64,AAAA";

test("WalkthroughTile renders a video element", async () => {
	const {container} = await render(<WalkthroughTile src={SRC} />);
	const video = container.querySelector("video");
	expect(video).not.toBeNull();
	expect(video?.getAttribute("src")).toBe(SRC);
});

test("WalkthroughTile exposes hover play/pause and fullscreen controls", async () => {
	await render(<WalkthroughTile src={SRC} />);
	await expect.element(page.getByRole("button", {name: /walkthrough/i})).toBeInTheDocument();
	await expect.element(page.getByRole("button", {name: "View capture fullscreen"})).toBeInTheDocument();
});

for (const aspect of ["video", "square", "portrait"] as const) {
	test(`WalkthroughTile renders the ${aspect} aspect`, async () => {
		const {container} = await render(<WalkthroughTile src={SRC} aspect={aspect} />);
		expect(container.querySelector("video")).not.toBeNull();
	});
}
