import type {Meta, StoryObj} from "storybook/internal/types";

import {CoreConnectV3} from "@core/core-ui/pages/core-core-connect-v3";

import manifest from "../../../../manifests/core-connect-v3.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// Core Connect V3 — V2 re-cut around the project lifecycle: apps grouped Design / Plan / Capture /
// Pay instead of one "Your apps" list, and Marketplace folded into Studio.
const meta = {
	// Leaf name must differ from V2's: the Designer Hub parity check keys templates on the last title
	// segment alone, so two leaves both called "Core Connect" would collide.
	title: "Templates/Core Connect/V3/Core Connect V3",
	component: CoreConnectV3,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Core Connect V3, unified portal. Canonical: <code>core-connect-v3</code>. The same merged app as V2
							— same surfaces, same install lifecycle — with the rail re-cut around the project lifecycle. V2's single
							"Your apps" heading gives way to four labelled groups in project order: <code>Design</code>,{" "}
							<code>Plan</code>, <code>Capture</code>, <code>Pay</code>. Each carries an icon, shown beside its label
							expanded and standing in for the whole section collapsed: the rail shows four group icons rather than
							every app, and clicking one opens a flyout of the apps under it — the same gesture and the same flyout an{" "}
							<code>expandable</code> nav item already uses, so a group and an item never behave differently. Each
							header carries two separate targets: the NAME opens a page about that stage (underlining on hover to
							advertise it), while the CHEVRON on its far right folds the apps beneath it away. The workspace opens
							already kitted out, so all four sections are populated from the start; a section disappears only if you
							uninstall everything under it. Marketplace leaves the shell's pinned slot and becomes the last item of the
							Studio group, since browsing and installing apps is studio work rather than a fixture of the frame. Studio
							is itself a group on exactly the same footing as the four stages — its own icon, so the collapsed rail is
							uniformly one icon per group and its perspectives move into a flyout; its name opens a Studio overview
							(one card per perspective) and its chevron folds the whole section, Marketplace included. Because every
							section here is named, Home is one too and takes a divider below it. Expanded, a group reads as a tree:
							the header is a parent row at item size rather than a small caption, and its apps hang off a vertical
							spine — aligned to the group icon's centre, starting below the icon, stopping at the last item — with a
							short elbow branching into each one. The nav find bar is back at the top, and a live query forces every
							folded group open so a match can never hide behind a collapsed header. The top-bar switcher moves up a
							rung too: V1 and V2 pick a project there, V3 picks the ORGANIZATION, since the rail beneath it is already
							cut by project lifecycle and the project is chosen further in. And the project IS chosen further in:{" "}
							<strong>Files</strong>, at the head of the rail between the nav search and the app stages, is one flat
							list of every record the workspace holds in that organization — a pipeline, a process, an object type, an
							action type, a product — each carrying the folder it is filed in. Opening a file lands you in the app that
							owns it, on that record, with the file&rsquo;s folder trail in the top bar instead of the
							perspective&rsquo;s; every one of those apps shows, beside each record it lists, the folder it came from,
							and clicking that reopens Files narrowed to it. Down the left are facets — type, project and tag, each
							with the count of files it would leave standing — rather than a folder tree: the folder is already printed
							under every row, and what this list is asked is &ldquo;show me the pipelines&rdquo;, which a facet answers
							in one click and a tree cannot answer at all. It stores no records of its own — it addresses the ones the
							other perspectives already render. Implemented as <code>CoreWC3Workspace</code> with{" "}
							<code>appGrouping="lifecycle"</code>, <code>marketplacePlacement="studio"</code>,{" "}
							<code>switcherScope="organization"</code> and <code>showFiles</code>, so all three releases share one
							implementation and cannot drift.
						</>
					}
				/>
			),
			description: {
				component:
					"Core Connect V3 — V2's merged workspace, re-cut around the project lifecycle. The sidebar stacks " +
					"Home with the installed apps directly beneath it, grouped into Design, Plan, Capture and Pay — each with " +
					"its own icon, which becomes the whole section when the sidebar is collapsed, its apps moving into a " +
					"flyout, and each header offering two targets — the name opens that stage's page, the chevron folds " +
					"its apps away; then a " +
					"divider; then Studio, whose last item is Marketplace. Files sits above them all, after the nav search: a " +
					"flat list of everything the workspace holds, filtered by type, project and tag from a facet rail on the " +
					"left, where opening a file opens the app that owns it and every app listing names the folder its records " +
					"came from. The top bar's switcher picks the organization here " +
					"rather than the project, the rail below it already being cut by lifecycle. It opens as a project already kitted out — nine of " +
					"the thirteen apps installed, so every stage has something under it — and the rest are there to add from " +
					"the Marketplace inside Studio, where anything can also be uninstalled. Which stage an app belongs to is " +
					"provisional nav metadata (APP_LIFECYCLE), not behaviour.",
			},
		},
	},
} satisfies Meta<typeof CoreConnectV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen wwc:w-full">
			<CoreConnectV3 />
		</div>
	),
};
