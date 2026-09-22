// Metric: no known failure modes.
// A registry of static detectors, each keyed to an fm-* id from domain_map.yaml. A
// detector returns true when the snippet exhibits that antipattern. Reason text is
// pulled from the failure mode's own `title`, so the catalog stays the source of truth.
//
// Not every fm-* is statically detectable from a snippet — some are runtime/semantic
// (e.g. "searchKey doesn't match a column id" needs the column defs). Those are listed
// in RUNTIME_ONLY so the test suite can assert coverage honestly instead of silently
// skipping them.

import {stripComments, usesJsx} from "./util.mjs";

const METRIC = "failure-mode";

// Tailwind-ish utility roots that, when used WITHOUT the wwc: prefix on a Core
// component, signal the unprefixed-className failure (fm-prim-5 / fm-setup-4 / fm-utils-3).
const UNPREFIXED_UTIL =
	/className=(?:"|'|\{?\s*(?:cn\()?["'])([^"'`]*\b(?:bg|text|p|px|py|m|mx|my|w|h|rounded|flex|grid|border)-[a-z0-9-]+)/;

function hasUnprefixedUtility(code) {
	const m = code.match(UNPREFIXED_UTIL);
	if (!m) return false;
	// Trigger only if at least one matched utility token lacks the wwc: prefix.
	return /(^|[\s"'`])(?!wwc:)(?:bg|text|p|px|py|m|mx|my|w|h|rounded|border)-[a-z0-9-]+/.test(m[1]);
}

// Each detector: { id, detect(code, catalog) -> boolean, fix }. The `reason` comes from
// the failure mode's title at grade time.
// NOTE on single-ownership (de-collinearization): some fm-* describe the SAME defect a
// dedicated metric already owns. Counting them here too would score one defect against
// two metrics (and, via the all-or-nothing roll-up, inflate the lift). So:
//   - barrel/bad-subpath imports (fm-prim-1, fm-setup-1) are owned by the `imports` metric;
//   - missing providers (fm-prim-2, fm-prim-3, fm-form-2) are owned by `provider-wiring`.
// They are intentionally NOT detected here — see OWNED_ELSEWHERE below.
const DETECTORS = [
	{
		id: "fm-form-3",
		detect: (c) =>
			/import\s*\{[^}]*\bForm(?:Field|Item|Control|Label|Message)?\b[^}]*\}\s*from\s*["']react-hook-form["']/.test(c),
		fix: 'Import Form* components from "@core/core-ui/form", not react-hook-form.',
	},
	{
		id: "fm-form-1",
		detect: (c) => usesJsx(c, "FormControl") && !usesJsx(c, "FormItem"),
		fix: "Wrap FormControl in a <FormItem> so useFormField() has context.",
	},
	{
		id: "fm-dt-2",
		detect: (c) => /renderSubComponent/.test(c) && !/getRowCanExpand/.test(c),
		fix: "Add getRowCanExpand={() => true} so rows can actually expand.",
	},
	{
		id: "fm-dt-3",
		detect: (c) => /getSubRows/.test(c) && /renderSubComponent/.test(c),
		fix: "Use getSubRows (tree rows) OR renderSubComponent (detail panel) — not both.",
	},
	{
		id: "fm-chart-1",
		detect: (c) => /from\s*["']echarts-for-react["']/.test(c) || usesJsx(c, "ReactECharts"),
		fix: "Use <ChartContainer> from @core/core-ui/chart instead of ReactECharts directly.",
	},
	{
		id: "fm-tok-1",
		detect: (c) => /prefers-color-scheme/.test(c),
		fix: "Toggle the .dark class on <html>; tokens have no prefers-color-scheme variant.",
	},
	{
		id: "fm-prim-5",
		detect: hasUnprefixedUtility,
		fix: "Prefix Tailwind utilities passed to Core components with wwc: (e.g. wwc:bg-red-500).",
	},
];

// fm-* owned by a DIFFERENT metric, so the failure-mode metric must not also count them
// (single-ownership — see the DETECTORS note). These are real, detected defects; they just
// score against `imports` or `provider-wiring`, never `failure-mode`.
export const OWNED_ELSEWHERE = new Set([
	"fm-prim-1", // barrel component import — owned by the `imports` metric
	"fm-setup-1", // barrel import (setup framing) — same defect, owned by `imports`
	"fm-prim-2", // Tooltip without TooltipProvider — owned by `provider-wiring`
	"fm-prim-3", // Sidebar without SidebarProvider — owned by `provider-wiring`
	"fm-form-2", // FormField without Form — owned by `provider-wiring`
]);

// fm-* that cannot be judged from a snippet alone (need column defs, runtime data, or
// service internals). Documented, not silently dropped.
export const RUNTIME_ONLY = new Set([
	"fm-setup-2", // missing tokens CSS import — app-entry concern, not a snippet
	"fm-setup-3", // fonts CDN in air-gapped env — environment concern
	"fm-tok-2", // token var used before tokens imported — cross-file ordering
	"fm-tok-3", // tailwind token utility without bridge import — cross-file
	"fm-dt-1", // searchKey must match a column id — needs the column defs
	"fm-chart-3", // pie data key names — needs the data shape
	"fm-chat-1", // apiEndpoint but mock service not replaced — runtime/service
	"fm-chat-2", // message.chart vs chartData — needs the message type
	"fm-chat-3", // pie keys in chat — needs data shape
	"fm-chart-2", // DOM util at module level — context-dependent, overlaps fm-utils-1
	"fm-utils-1", // DOM util in non-browser context — runtime context
	"fm-utils-2", // cn() dedup expectation — semantic expectation, no wrong "code"
	"fm-utils-3", // bare cn() with unprefixed classes — same family as fm-prim-5 (className case covered there)
	"fm-prim-4", // raw className vs cn() — overlaps fm-prim-5 detection
	"fm-setup-4", // unprefixed class — same antipattern as fm-prim-5 (covered there)
]);

/** Ids this validator statically detects (used by the test suite for coverage). */
export const DETECTED_IDS = DETECTORS.map((d) => d.id);

/**
 * @param {string} code
 * @param {import("./load.mjs").Catalog} catalog
 * @returns {import("./util.mjs").Finding[]}
 */
export function detectFailureModes(code, catalog) {
	const clean = stripComments(code);
	const findings = [];

	for (const det of DETECTORS) {
		if (!det.detect(clean, catalog)) continue;
		const fm = catalog.failureModeById.get(det.id);
		findings.push({
			metric: METRIC,
			pass: false,
			reason: fm ? `${det.id}: ${fm.title}` : det.id,
			suggestedFix: det.fix,
			source: det.id,
		});
	}

	if (findings.length === 0) {
		findings.push({
			metric: METRIC,
			pass: true,
			reason: "No known failure modes detected.",
			suggestedFix: "",
			source: "domain_map.yaml",
		});
	}
	return findings;
}
