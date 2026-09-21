import assert from "node:assert/strict";
import {describe, it} from "node:test";

import {findPrefixedClassesInJsDoc} from "../check-doc-classes.mjs";

describe("JSDoc wwc: class check", () => {
	it("flags a prefixed class recommended in a single-line JSDoc", () => {
		const findings = findPrefixedClassesInJsDoc('\t/** Forwarded to the scrim — e.g. `className="wwc:top-14"`. */\n');
		assert.equal(findings.length, 1);
		assert.equal(findings[0].line, 1);
	});

	it("flags a prefixed class anywhere in a multi-line JSDoc", () => {
		const source = ["/**", " * Brand shown in the header.", ' * Pass `<img className="wwc:h-6" />`.', " */"].join("\n");
		assert.deepEqual(
			findPrefixedClassesInJsDoc(source).map((finding) => finding.line),
			[3],
		);
	});

	it("leaves the library's own classes alone — they are the implementation, not the docs", () => {
		const source = ['const Card = () => <div className="wwc:rounded-xl wwc:border" />;', "// 21px ≈ wwc:text-sm"].join(
			"\n",
		);
		assert.deepEqual(findPrefixedClassesInJsDoc(source), []);
	});

	it("does not open a comment on a `/*` inside a string or JSX text", () => {
		const source = [
			'<input accept="image/*" />',
			"<Mono>products/*/manifests/*.json</Mono>",
			'<div className="wwc:grid wwc:gap-3" />',
		].join("\n");
		assert.deepEqual(findPrefixedClassesInJsDoc(source), []);
	});

	it("closes the block at `*/`, so following code is not scanned as documentation", () => {
		const source = ["/**", " * A widget.", " */", 'export const x = "wwc:hidden";'].join("\n");
		assert.deepEqual(findPrefixedClassesInJsDoc(source), []);
	});
});
