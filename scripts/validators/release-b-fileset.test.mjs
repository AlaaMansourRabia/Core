import assert from "node:assert/strict";
import {describe, it} from "node:test";

import {gradeFileSet} from "./index.mjs";
import {loadCatalog} from "./load.mjs";

const catalog = loadCatalog();

describe("Release B file-set validator", () => {
	it("aggregates imports and renders across multiple TSX files", () => {
		const result = gradeFileSet(
			{
				"src/App.tsx":
					'import { Button as Action } from "@corensystem/core-ui/button";\nexport {Panel} from "./Panel";\nexport const App=()=> <Action>Save</Action>;',
				"src/Panel.tsx": 'import { Card } from "@corensystem/core-ui/card";\nexport const Panel=()=> <Card>Panel</Card>;',
			},
			{},
			catalog,
		);
		assert.deepEqual(result.coverage.imported, ["Button", "Card"]);
		assert.deepEqual(result.coverage.rendered, ["Button", "Card"]);
		assert.deepEqual(result.coverage.visiblyExercised, ["Button", "Card"]);
		assert.equal(result.coverage.rates.rendered, 1);
		assert.deepEqual(result.coverage.tiers.component, ["Button", "Card"]);
	});

	it("reports hard-coded CSS values with category and location", () => {
		const result = gradeFileSet({
			"src/App.tsx": 'import { Button } from "@corensystem/core-ui/button"; export const App=()=> <Button>Save</Button>;',
			"src/app.css":
				".panel { color: #123456; padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px #000; font-size: 14px; }",
		});
		assert.deepEqual(
			new Set(result.tokens.hardCoded.map((item) => item.category)),
			new Set(["color", "spacing", "radius", "shadow", "typography"]),
		);
		assert.ok(result.tokens.hardCoded.every((item) => item.path === "src/app.css" && item.line === 1));
		assert.equal(result.tokens.overall.score < 1, true);
	});

	it("treats Core variables as tokenized and supports narrow exceptions", () => {
		const result = gradeFileSet({
			"src/App.tsx": 'import { Card } from "@corensystem/core-ui/card"; export const App=()=> <Card />;',
			"src/app.css": [
				".panel {",
				"  color: var(--color-foreground);",
				"  padding: var(--spacing-4);",
				"  border-radius: var(--radius-md);",
				"  box-shadow: var(--shadow-sm);",
				"  font-size: var(--font-size-sm);",
				"  /* core-token-exception: required customer brand */",
				"  border-color: #ff00aa;",
				"}",
			].join("\n"),
		});
		assert.equal(result.tokens.hardCoded.length, 0);
		assert.equal(result.tokens.exceptions.length, 1);
		assert.equal(result.tokens.overall.score, 1);
	});

	it("marks hidden and near-zero component renders as not visibly exercised", () => {
		const result = gradeFileSet({
			"src/App.tsx": [
				'import { Button } from "@corensystem/core-ui/button";',
				'import { Card } from "@corensystem/core-ui/card";',
				'export const App=()=> <><Button className="hidden">Save</Button><Card style={{ width: 1 }} /></>;',
			].join("\n"),
		});
		assert.deepEqual(result.coverage.rendered, ["Button", "Card"]);
		assert.deepEqual(result.coverage.visiblyExercised, []);
		assert.equal(result.visibility.hidden[0].component, "Button");
		assert.equal(result.visibility.nearZero[0].component, "Card");
		assert.equal(result.metrics["artifact-visibility"], false);
	});

	it("returns inventory metadata when an inventory file is present", () => {
		const result = gradeFileSet({
			"core-inventory.json": JSON.stringify({metadata: {version: 2}, artifacts: ["Button"]}),
		});
		assert.equal(result.inventory.present, true);
		assert.deepEqual(result.inventory.files[0].metadata, {version: 2});
		assert.equal(result.inventory.files[0].entries, 1);
	});
});
