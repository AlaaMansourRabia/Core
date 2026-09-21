import {expect, test} from "vitest";
import {render} from "vitest-browser-react";

import {CoreAppTopBar} from "./core-app-top-bar";

// WC-GAP-03 — the top bar hardcoded English copy; its built-in strings and aria-labels are now
// overridable via `labels`, with English defaults for any key left unset.
test("labels override the top bar's built-in copy (WC-GAP-03)", async () => {
	const {container} = await render(
		<CoreAppTopBar activeLabel="Home" labels={{moreTopBarActions: "مزيد من الإجراءات"}} />,
	);
	expect(container.querySelector('button[aria-label="مزيد من الإجراءات"]')).not.toBeNull();
});

test("top bar falls back to English defaults when no labels are given", async () => {
	const {container} = await render(<CoreAppTopBar activeLabel="Home" />);
	expect(container.querySelector('button[aria-label="More top bar actions"]')).not.toBeNull();
});
