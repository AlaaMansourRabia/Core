import {WC3Workspace} from "./core-wc3-workspace";

// WakeCap Connect V2 — the admin workspace and the app marketplace merged into ONE app.
//
// V1 shipped Connect as two portals: WC3 Workspace for the admin, AppInstaller for the end user. V2
// collapses that split. There is one shell and one sidebar, stacked:
//
//   Home               ← always present; app launcher once apps exist, install CTA while none do
//   Your apps          ← installed apps, green dot until first opened; no divider, Home lands here
//   ───────────────
//   Studio             ← Analysis, Processes, Pipelines, Products, Lineage, Ontology
//   ───────────────
//   Marketplace        ← pinned at the bottom; install an app and it lands in the apps section
//
// The dividers are not drawn here: CoreAppSidebar separates consecutive nav groups, divides Home from
// the groups below it, and pins the marketplace entry under them — expanded AND collapsed — so the
// whole stack falls out of the group structure.
//
// This template is deliberately a thin alias rather than a fork. Every surface it shows already exists
// — the perspectives come from CoreWC3Workspace, the store and install lifecycle from
// app-marketplace-shared (shared with AppInstaller) — so V1 and V2 cannot drift apart.

/**
 * WakeCap Connect V2 template: the WC3 admin workspace with the marketplace folded in, as a single
 * app. One sidebar carries a pinned Home, the installed apps directly beneath it, the admin
 * perspectives under a Studio label, and a pinned Marketplace entry; installing an app from the store
 * adds it to the apps section without leaving the app.
 *
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the WakeCapConnect template docs in Storybook). Slated for removal from the public API
 * in a future major.
 */
export function WakeCapConnect() {
	return <WC3Workspace withMarketplace />;
}
