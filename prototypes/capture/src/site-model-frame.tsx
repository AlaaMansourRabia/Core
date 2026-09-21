// The Site map: a self-contained ThatOpen / web-ifc 3D canvas (public/site/index.html) that renders the
// site model (site-b.frag — walls + slabs, each element named by house code) with a DroneDeploy
// satellite ortho laid underneath as a fixed-aligned ground plane, plus per-house hover highlighting.
//
// Hosted as a same-origin iframe (served from public/site/ by this dev server) so it can load the exact
// @thatopen/three versions the shipped site-b.frag was built with (3.4.8 / 3.4.7 / three 0.185, via
// esm.sh) without clashing with the monorepo's pinned versions used by the house-level FragmentViewer.
//
// Clicking a highlighted house posts a `ue22-part-click` message up to SiteView, which drives the
// drill-into-house transition. Assets served at /site-b.frag, /ortho.png, /ortho-meta.js, /worker.mjs.
import type {Ref} from "react";

const SITE_URL = "/site/index.html";

// `iframeRef` is forwarded so the parent can postMessage into the site canvas (e.g. TV-mode camera focus).
// `representation` selects how the villas are drawn: "assets" (the detailed walls/slabs model) or
// "blocks" (each villa as a single massing block — the "No Assets" view). The canvas reads it from the
// `?rep=blocks` query the URL below adds.
export function SiteModelFrame({
	iframeRef,
	representation = "assets",
}: {
	iframeRef?: Ref<HTMLIFrameElement>;
	representation?: "assets" | "blocks";
}) {
	const src = representation === "blocks" ? `${SITE_URL}?rep=blocks` : SITE_URL;
	return (
		<div className="wwc:relative wwc:h-full wwc:min-h-0 wwc:w-full wwc:overflow-hidden">
			<iframe
				ref={iframeRef}
				src={src}
				title="ThatOpen site model + satellite ortho"
				className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full wwc:border-0"
				allow="fullscreen"
			/>
		</div>
	);
}
