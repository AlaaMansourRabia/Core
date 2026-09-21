import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {FragmentViewerProvider, useFragmentViewer, useOptionalFragmentViewer} from "./context";

/**
 * `useOptionalFragmentViewer` exists because a surface whose stage may or may not be a
 * FragmentViewer — Workforce Map View renders a placeholder plan when it is not — used to reach for
 * `try { useFragmentViewer() } catch { null }`. That is a conditional hook call: it reads as one to
 * `react-hooks(rules-of-hooks)`, and it swallows every other error the hook might raise.
 */

function Probe() {
	const viewer = useOptionalFragmentViewer();
	return <p>{viewer ? "has viewer" : "no viewer"}</p>;
}

test("useOptionalFragmentViewer returns null outside a provider", async () => {
	await render(<Probe />);
	await expect.element(page.getByText("no viewer")).toBeVisible();
});

test("useOptionalFragmentViewer returns the viewer under a provider", async () => {
	await render(
		<FragmentViewerProvider>
			<Probe />
		</FragmentViewerProvider>,
	);
	await expect.element(page.getByText("has viewer")).toBeVisible();
});

test("useFragmentViewer still throws outside a provider", async () => {
	// The strict hook keeps its contract — the optional one is an addition, not a loosening.
	function Strict() {
		useFragmentViewer();
		return null;
	}
	expect(() => render(<Strict />)).rejects.toThrowError(/FragmentViewerProvider/);
});
