// P1a trust gate: prove the graders are correct BEFORE using them to judge agents.
//
// The fixtures ARE the source of truth — every `wrong`/`correct` block comes straight
// from skills/_artifacts/domain_map.yaml, so these tests stay honest as the catalog
// grows. Run with: node --test scripts/validators/
//
// Exit criteria for P1a: this suite is green.

import assert from "node:assert/strict";
import {describe, it} from "node:test";

import {validateComponentChoice} from "./component-choice.mjs";
import {DETECTED_IDS, detectFailureModes, OWNED_ELSEWHERE, RUNTIME_ONLY} from "./failure-modes.mjs";
import {validateImports} from "./imports.mjs";
import {loadCatalog} from "./load.mjs";
import {validateProviders} from "./providers.mjs";

const catalog = loadCatalog();

const fails = (findings, source) => findings.some((f) => !f.pass && f.source === source);
const anyFail = (findings) => findings.some((f) => !f.pass);

describe("coverage: every fm-* is accounted for", () => {
	it("each failure mode is statically detected, owned by another metric, or explicitly runtime-only", () => {
		const detected = new Set(DETECTED_IDS);
		const unaccounted = catalog.failureModes
			.map((fm) => fm.id)
			.filter((id) => !detected.has(id) && !RUNTIME_ONLY.has(id) && !OWNED_ELSEWHERE.has(id));
		assert.deepEqual(
			unaccounted,
			[],
			`Unaccounted fm-* ids (add a detector, list in OWNED_ELSEWHERE, or RUNTIME_ONLY): ${unaccounted}`,
		);
	});

	it("no fm-* is double-counted across detected / owned-elsewhere / runtime-only", () => {
		const buckets = [new Set(DETECTED_IDS), OWNED_ELSEWHERE, RUNTIME_ONLY];
		const dupes = [];
		for (const fm of catalog.failureModes) {
			const hits = buckets.filter((b) => b.has(fm.id)).length;
			if (hits > 1) dupes.push(fm.id);
		}
		assert.deepEqual(dupes, [], `fm-* listed in more than one bucket (single-ownership violated): ${dupes}`);
	});
});

describe("failure-modes validator vs domain_map fixtures", () => {
	for (const id of DETECTED_IDS) {
		const fm = catalog.failureModeById.get(id);
		assert.ok(fm, `fixture ${id} missing from domain_map`);

		it(`${id}: flags the wrong example`, () => {
			const findings = detectFailureModes(fm.wrong, catalog);
			assert.ok(fails(findings, id), `expected ${id} to be flagged on its wrong fixture`);
		});

		it(`${id}: passes the correct example`, () => {
			const findings = detectFailureModes(fm.correct, catalog);
			assert.ok(!fails(findings, id), `expected ${id} NOT to be flagged on its correct fixture`);
		});
	}
});

describe("provider-wiring validator", () => {
	it("fm-prim-2: Tooltip without TooltipProvider fails; wrapped passes", () => {
		const fm = catalog.failureModeById.get("fm-prim-2");
		assert.ok(anyFail(validateProviders(fm.wrong, catalog)), "wrong should fail");
		assert.ok(!anyFail(validateProviders(fm.correct, catalog)), "correct should pass");
	});

	it("fm-form-2: FormField without Form fails; wrapped in <Form> passes", () => {
		const fm = catalog.failureModeById.get("fm-form-2");
		assert.ok(anyFail(validateProviders(fm.wrong, catalog)), "wrong should fail");
		assert.ok(!anyFail(validateProviders(fm.correct, catalog)), "correct should pass");
	});
});

describe("imports validator", () => {
	it("fm-prim-1: barrel component import fails; deep path passes", () => {
		const fm = catalog.failureModeById.get("fm-prim-1");
		assert.ok(anyFail(validateImports(fm.wrong, catalog)), "barrel import should fail");
		assert.ok(!anyFail(validateImports(fm.correct, catalog)), "deep path should pass");
	});

	it("flags a non-existent core-ui subpath", () => {
		const findings = validateImports('import { Wat } from "@core/core-ui/not-a-real-thing";', catalog);
		assert.ok(anyFail(findings));
	});
});

describe("component-choice validator (expected / acceptable / forbidden)", () => {
	const task = {expected: ["Sheet"], acceptable: ["Drawer"], forbidden: ["Dialog"]};

	it("forbidden pick (Dialog) fails", () => {
		const code =
			'import { Dialog, DialogContent } from "@core/core-ui/dialog";\n<Dialog><DialogContent>filters</DialogContent></Dialog>';
		assert.ok(anyFail(validateComponentChoice(code, task, catalog)));
	});

	it("expected pick (Sheet) passes", () => {
		const code =
			'import { Sheet, SheetContent } from "@core/core-ui/sheet";\n<Sheet><SheetContent>filters</SheetContent></Sheet>';
		assert.ok(!anyFail(validateComponentChoice(code, task, catalog)));
	});

	it("acceptable alternative (Drawer) passes — no overfitting", () => {
		const code = 'import { Drawer } from "@core/core-ui/drawer";\n<Drawer>filters</Drawer>';
		assert.ok(!anyFail(validateComponentChoice(code, task, catalog)));
	});
});
