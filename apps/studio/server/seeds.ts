// Canonical template seeds — the single source of truth for "template.id → the real @corensystem/core-ui
// page source that renders it." Both the read-only preview (server/preview.ts) and the workspace
// materializer (server/workspace.ts) build from these: preview compiles the source in memory; the
// materializer writes it to a workspace's src/page.tsx as the editable seed the external editor owns.
import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const COMPONENTS_SRC = join(ROOT, "packages", "components", "src");

// File-based seeds inline the actual page source (so internals — headline, image, layout — are editable)
// and append a default export that mounts it with mock data inside a TooltipProvider.
type FileSeed = {file: string; render: string};
const FILE_SEEDS: Record<string, FileSeed> = {
	"login-page": {file: "pages/core-login-page.tsx", render: "<LoginPage onLogin={() => {}} />"},
	"regular-dashboard": {
		file: "pages/core-org-performance.tsx",
		render: "<OrgPerformance selectedOrg={__WC_ORGS[0]} />",
	},
	"core-org-workforce-intelligence": {
		file: "pages/core-org-workforce-intelligence.tsx",
		render: "<OrgWorkforceIntelligence selectedOrg={__WC_ORGS[0]} />",
	},
	detail: {file: "pages/core-project-quality-issues.tsx", render: "<ProjectQualityIssues project={__WC_PROJECT} />"},
	"core-project-overview": {
		file: "pages/core-project-overview.tsx",
		render: "<ProjectOverview project={__WC_PROJECT} />",
	},
	"core-project-reality-capture": {
		file: "pages/core-project-reality-capture.tsx",
		render: "<ProjectRealityCapture project={__WC_PROJECT} />",
	},
	"core-project-schedule-cost": {
		file: "pages/core-project-schedule-cost.tsx",
		render: "<ProjectScheduleCost project={__WC_PROJECT} />",
	},
	"core-project-workforce-safety": {
		file: "pages/core-project-workforce-safety.tsx",
		render: "<ProjectWorkforceSafety project={__WC_PROJECT} />",
	},
	"error-page": {
		file: "error-page.tsx",
		render:
			'<ErrorPage type="404" code="404" title="Page not found" description="The page you\'re looking for doesn\'t exist or was moved." showCode />',
	},
	// Promoted from the former apps/web examples — self-contained pages (no props).
	"analytics-overview": {file: "pages/core-analytics-overview.tsx", render: "<AnalyticsOverview />"},
	"admin-panel": {file: "pages/core-admin-panel.tsx", render: "<AdminPanel />"},
	timesheet: {
		file: "pages/core-timesheet.tsx",
		render: "<Timesheet />",
	},
	"project-setup": {file: "pages/core-project-setup.tsx", render: "<ProjectSetup />"},
	"design-canvas": {file: "pages/core-design-canvas.tsx", render: "<DesignCanvas />"},
	"task-monitor": {file: "pages/core-task-monitor.tsx", render: "<TaskMonitorWorkspace />"},
};

const SEED_HEADER = `import {TooltipProvider as __WCTP} from "@corensystem/core-ui/tooltip";
import {MOCK_ORGANIZATIONS as __WC_ORGS, getProjectsByOrg as __WC_PROJ} from "@corensystem/core-ui/data/mock-data";
`;
const seedFooter = (render: string) => `
const __WC_PROJECT = __WC_ORGS.length ? __WC_PROJ(__WC_ORGS[0].id)[0] : undefined;
export default function Page() {
  return <__WCTP>${render}</__WCTP>;
}
`;

export type Seed = {source: string; resolveDir: string};

export function hasSeed(id: string): boolean {
	return id in FILE_SEEDS;
}

export function seedFor(id: string): Seed | null {
	const s = FILE_SEEDS[id];
	if (!s) return null;
	const file = join(COMPONENTS_SRC, s.file);
	const source = SEED_HEADER + readFileSync(file, "utf8") + seedFooter(s.render);
	return {source, resolveDir: dirname(file)};
}

// What a standalone preview needs to mount ONLY this template (no nav shell): the page's source file (so
// edits hot-reload), the exported component name, and the render expression with its mock props.
export type PreviewSpec = {sourceRel: string; component: string; render: string};

export function previewSpec(id: string): PreviewSpec | null {
	const s = FILE_SEEDS[id];
	if (!s) return null;
	const component = /^<([A-Za-z0-9_]+)/.exec(s.render)?.[1];
	if (!component) return null;
	// Relative path from the scaffolded preview dir (<worktree>/.core-preview) to the page source.
	return {sourceRel: `../packages/components/src/${s.file.replace(/\.tsx$/, "")}`, component, render: s.render};
}
