// Shared docs page for a template archetype: standard blocks + the manifest contract panel + an
// optional canonical-source / variants note + the live Preview rendered inline. Used by each
// Templates/<Archetype> stories file so a template owns its Docs and Preview under one sidebar node.

import {Description, Primary, Subtitle, Title, Unstyled} from "@storybook/addon-docs/blocks";

import {TemplateManifestPanel, type TemplateManifest} from "./TemplateManifestPanel";

const note: React.CSSProperties = {
	fontSize: 13,
	lineHeight: 1.6,
	color: "#374151",
	margin: "4px 0 20px",
};
const noteLabel: React.CSSProperties = {
	display: "block",
	fontSize: 11,
	fontWeight: 700,
	letterSpacing: 0.4,
	textTransform: "uppercase",
	color: "#6b7280",
	margin: "0 0 6px",
};

export function TemplateDocsPage({
	manifest,
	family,
}: {
	manifest: TemplateManifest;
	/** Canonical-source vs variants/instances summary (rendered under the contract). */
	family?: React.ReactNode;
}) {
	return (
		<>
			<Title />
			<Subtitle />
			<Description />
			<TemplateManifestPanel manifest={manifest} />
			{family && (
				<Unstyled>
					<div style={note}>
						<span style={noteLabel}>Canonical source · variants / instances</span>
						{family}
					</div>
				</Unstyled>
			)}
			<Primary />
		</>
	);
}
