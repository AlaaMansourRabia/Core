import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {StageContent} from "./stage-content";

test("renders the model header and its initial loading veil", async () => {
	await render(<StageContent />);
	await expect.element(page.getByText("Duplex.frag")).toBeVisible();
	await expect.element(page.getByText("Loading fragments…")).toBeVisible();
});

test("renders the floor rail with each level", async () => {
	await render(<StageContent />);
	await expect.element(page.getByRole("button", {name: /Level 02/})).toBeVisible();
	await expect.element(page.getByRole("button", {name: /Ground/})).toBeVisible();
});

test("exposes the viewer toggles by aria-label", async () => {
	await render(<StageContent />);
	await expect.element(page.getByRole("switch", {name: "Workers"})).toBeVisible();
	await expect.element(page.getByRole("switch", {name: "4D"})).toBeVisible();
});

test("renders the timeline scrubber slider", async () => {
	await render(<StageContent />);
	// The scrubber lives in the model stage, which fades in from opacity-0 after the mock
	// load settles — assert presence (deterministic) rather than racing the transition.
	await expect.element(page.getByRole("slider")).toBeInTheDocument();
});

test("pre-selects the floor passed via initialFloorId", async () => {
	await render(<StageContent initialFloorId="lvl-02" />);
	await expect.element(page.getByRole("button", {name: /Level 02/})).toHaveAttribute("aria-pressed", "true");
});
