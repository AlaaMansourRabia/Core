import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {describe, it} from "node:test";
import {fileURLToPath} from "node:url";

// packages/tokens has only a `build` script, so theme.css is invisible to lint, format:check,
// typecheck and the component tests. This is the one gate that reads the token values themselves.
// It exists because of #279: --accent sat 0.025 L off a white popover, so the menu highlight it
// painted was invisible, and nothing in the repo could tell.

const THEME = join(dirname(fileURLToPath(import.meta.url)), "../../packages/tokens/src/theme.css");

/** The two value blocks: `:root` (light) and `.dark, .wwc-invert`. */
function readThemes() {
	const css = readFileSync(THEME, "utf8");
	const lightAt = css.search(/^:root,$/m);
	const darkAt = css.search(/^\.dark,$/m);
	assert.ok(lightAt !== -1 && darkAt > lightAt, "theme.css no longer opens with `:root,` then `.dark,`");
	const light = css.slice(lightAt, darkAt);
	const dark = css.slice(darkAt);
	const parse = (block) => {
		const tokens = {};
		for (const [, name, l, c, h] of block.matchAll(
			/^\t--([a-z0-9-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\);/gm,
		)) {
			tokens[name] ??= {l: Number(l), c: Number(c), h: Number(h)};
		}
		return tokens;
	};
	return {light: parse(light), dark: parse(dark)};
}

/** oklch → linear sRGB → WCAG relative luminance. */
function luminance({l, c, h}) {
	const hr = (h * Math.PI) / 180;
	const [L, a, b] = [l, c * Math.cos(hr), c * Math.sin(hr)];
	const [l_, m_, s_] = [
		L + 0.3963377774 * a + 0.2158037573 * b,
		L - 0.1055613458 * a - 0.0638541728 * b,
		L - 0.0894841775 * a - 1.291485548 * b,
	].map((v) => v ** 3);
	const rgb = [
		4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
		-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
		-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
	];
	return rgb.map((v) => Math.max(0, Math.min(1, v))).reduce((sum, v, i) => sum + [0.2126, 0.7152, 0.0722][i] * v, 0);
}

function contrast(a, b) {
	const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
	return (x + 0.05) / (y + 0.05);
}

const themes = readThemes();

describe("menu highlight token", () => {
	for (const [name, tokens] of Object.entries(themes)) {
		it(`is perceptible against every surface a menu opens over (${name})`, () => {
			assert.ok(tokens["menu-highlight"], `${name}: --menu-highlight is missing`);
			for (const surface of ["popover", "card", "background", "sidebar"]) {
				const ratio = contrast(tokens["menu-highlight"], tokens[surface]);
				assert.ok(
					ratio >= 1.28,
					`${name}: --menu-highlight on --${surface} is ${ratio.toFixed(4)}:1, below the 1.28 floor`,
				);
			}
		});

		it(`keeps its label legible on the highlight (${name})`, () => {
			const ratio = contrast(tokens["menu-highlight-foreground"], tokens["menu-highlight"]);
			assert.ok(ratio >= 7, `${name}: label on highlight is ${ratio.toFixed(2)}:1, below AAA`);
		});

		it(`stays a token of its own, not an alias of --accent or --muted (${name})`, () => {
			// The guard against a future "simplification" collapsing it back and reopening #279:
			// --accent is a selected-state fill (Calendar day, Toggle on-state) and --muted is the
			// static header band and the menu separator's own colour.
			for (const other of ["accent", "muted"]) {
				assert.notDeepEqual(tokens["menu-highlight"], tokens[other], `${name}: --menu-highlight collapsed onto --${other}`);
			}
		});
	}

	it("clears --muted and does not collapse onto --border in dark", () => {
		// The original ladder put menu-highlight BELOW --border (0.30), which capped it at 1.20:1
		// against --card and is why #279 was reopened. The dark palette has no room for a perceptible
		// band under the border, so the highlight passes it — but it must stay visibly clear of the
		// border, or a hovered row and a border read as the same value.
		const {dark} = themes;
		assert.ok(
			dark.muted.l < dark["menu-highlight"].l,
			`menu-highlight ${dark["menu-highlight"].l} must sit above --muted ${dark.muted.l}`,
		);
		assert.ok(
			Math.abs(dark["menu-highlight"].l - dark.border.l) >= 0.02,
			`menu-highlight ${dark["menu-highlight"].l} is within 0.02 L of --border ${dark.border.l}`,
		);
	});

	it("proves --accent alone could not have done the job", () => {
		// The bug as filed, pinned as a fact: light --accent on a white popover.
		assert.ok(contrast(themes.light.accent, themes.light.popover) < 1.12);
	});
});
