import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {FloorProgressBar} from "./floor-progress-bar";

test("FloorProgressBar renders a progressbar with the clamped value", async () => {
	await render(<FloorProgressBar value={140} />);
	const bar = page.getByRole("progressbar");
	await expect.element(bar).toHaveAttribute("aria-valuenow", "100");
});

test("FloorProgressBar clamps negative values to zero", async () => {
	await render(<FloorProgressBar value={-20} />);
	await expect.element(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
});

test("FloorProgressBar renders the primary tone", async () => {
	const {container} = await render(<FloorProgressBar value={50} tone="primary" />);
	expect(container.querySelector('[role="progressbar"]')?.className).toContain("wwc:text-primary");
});

test("FloorProgressBar hides the track when showTrack is false", async () => {
	const {container} = await render(<FloorProgressBar value={50} showTrack={false} />);
	expect(container.innerHTML).toContain("wwc:opacity-0");
});
