// Core templates (the .template.json tier), listed once and shared by the sidebar nav and
// the /templates/:id viewer so they never drift. id matches the manifest id.
export interface TemplateMeta {
	id: string;
	name: string;
	/** Product release this template belongs to, mirroring the manifest `product` block and the
	 *  Storybook title (Templates/Core Connect/V1/…). Grouped entries must stay contiguous. */
	group?: string;
}

// Grouped releases lead the list so their entries stay contiguous under one nav heading; the
// ungrouped templates follow alphabetically.
export const TEMPLATES: TemplateMeta[] = [
	{id: "wc3-workspace", name: "WC3 Workspace", group: "Core Connect / V1"},
	{id: "app-installer", name: "AppInstaller", group: "Core Connect / V1"},
	{id: "core-connect", name: "Core Connect", group: "Core Connect / V2"},
	{id: "core-connect-v3", name: "Core Connect V3", group: "Core Connect / V3"},
	{id: "blueprint-viewer", name: "Single Floor", group: "Building Viewer / Blueprint Viewer"},
	{id: "blueprint-viewer-3", name: "Multi-Floor Split", group: "Building Viewer / Blueprint Viewer"},
	{id: "admin-panel", name: "Admin Panel"},
	{id: "clinic", name: "Clinic"},
	{id: "error-page", name: "Error Page"},
	{id: "login-page", name: "Login Page"},
	{id: "map-compare-layout", name: "Map Compare Layout"},
	{id: "object-drawing-canvas", name: "Object Drawing Canvas"},
	{id: "progress-details", name: "Progress Details"},
	{id: "safety-manager", name: "Safety Manager"},
	{id: "site-reality", name: "Site Reality"},
	{id: "timesheet", name: "Timesheet"},
	{id: "work-permit", name: "Work Permit"},
	{id: "workforce", name: "Workforce"},
];
