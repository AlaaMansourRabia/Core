import {CONNECT_STARTER_APPS} from "./app-marketplace-shared";
import {WC3Workspace} from "./core-wc3-workspace";

// Core Connect V3 — V2's single merged app, re-cut around the project lifecycle.
//
// V2 listed every installed app under one "Your apps" heading and pinned Marketplace at the very
// bottom of the shell. V3 keeps the same surfaces and the same install lifecycle, and changes only
// how the rail is organised:
//
//   Home               ← always present; the launcher for the installed apps
//   Design             ← the four lifecycle sections, in project order, replacing "Your apps". Each
//   Plan                 carries an icon, so collapsing the sidebar folds the whole section into that
//   Capture              one icon with its apps in a flyout behind it. The workspace opens already
//   Pay                  kitted out; a section hides only if you uninstall everything under it.
//   ───────────────
//   Studio             ← Analysis, Processes, Pipelines, Products, Lineage, Ontology, Marketplace
//
// Marketplace moves inside Studio: browsing and installing apps is something you do in the studio,
// not a permanent fixture of the shell. Which stage an app belongs to lives in APP_LIFECYCLE in
// app-marketplace-shared.tsx, beside the catalogue it describes.
//
// The top-bar switcher also moves up a rung: in V3 it picks the ORGANIZATION, not the project. The
// rail below it is already cut by project lifecycle, so the one thing the shell still has to scope
// is which company you are working inside; the project is chosen further in.
//
// And the project IS chosen further in — in Files, the other thing V3 adds. Everything the workspace
// holds gets an address in one folder tree rooted at the selected organization: a pipeline, a process,
// an object type, an action type. Opening a file lands you in the app that owns it, on that record;
// every one of those apps shows, beside each record it lists, the folder it came from. The tree stores
// no records of its own — it addresses the ones the other perspectives already render.
//
// Like V2 this is a thin alias, not a fork — the whole difference is a handful of props, so all
// three releases share one implementation and cannot drift.

/**
 * Core Connect V3 template: the merged workspace with its installed apps grouped by project
 * lifecycle stage (Design / Plan / Capture / Pay) instead of a single "Your apps" list, the
 * Marketplace carried inside the Studio group rather than pinned to the shell, the top-bar switcher
 * scoped to organizations instead of projects, and a Files entry at the head of the rail that browses
 * every record in the organization by folder and opens each in the app that owns it.
 *
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the CoreConnectV3 template docs in Storybook). Slated for removal from the public
 * API in a future major.
 */
export function CoreConnectV3() {
	return (
		<WC3Workspace
			withMarketplace
			appGrouping="lifecycle"
			marketplacePlacement="studio"
			switcherScope="organization"
			showFiles
			preinstalledApps={CONNECT_STARTER_APPS}
		/>
	);
}
