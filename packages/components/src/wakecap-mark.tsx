import * as React from "react";

/**
 * The WakeCap bot mark. A single glyph with no tile of its own, so it takes `currentColor`:
 * on a light surface it renders as the Wakecap-Bot-Black export, on a dark one as Wakecap-Bot-White.
 *
 * The eyes blink twice: every 5s each one collapses toward its own middle and reopens, twice in
 * quick succession (100ms a lid), then holds open for the rest of the cycle. They are cut out of
 * the body with a mask rather than painted in the surface colour, which keeps the mark single-token
 * and lets the eyes be real elements — a path's subpaths cannot be transformed on their own, which is
 * why the source ships them separately. `transform-box: fill-box` makes `transform-origin: center`
 * resolve against each eye's own box, so it closes from both edges instead of sliding upward.
 *
 * The keyframes ride inside the SVG rather than in the Tailwind layer: the two hand-maintained
 * `wakecore-render.css` sheets have no generator, so a utility-based animation would have to be
 * patched into both by hand or silently vanish in Studio and open-design.
 *
 * Internal — shared by `FloatingAssistant` (its trigger) and `AIChat` (its empty state). It lives
 * in its own module because `FloatingAssistant` already imports `AIChat`, so re-exporting it from
 * there would make the two files circular.
 */
export function WakecapMark({className}: {className?: string}) {
	const uid = React.useId().replace(/:/g, "");
	const maskId = `${uid}-eyes`;

	return (
		<svg
			viewBox="0 0 145 145"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			fill="currentColor"
			className={className}
		>
			<style>
				{
					"@keyframes wc-assistant-blink{0%,88%{transform:scaleY(1)}90%{transform:scaleY(.08)}92%{transform:scaleY(1)}94%{transform:scaleY(.08)}96%,100%{transform:scaleY(1)}}.wc-assistant-eye{transform-box:fill-box;transform-origin:center;animation:wc-assistant-blink 5s ease-in-out infinite}@media (prefers-reduced-motion:reduce){.wc-assistant-eye{animation:none}}"
				}
			</style>
			<mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="145" height="145">
				<rect width="145" height="145" fill="white" />
				<rect className="wc-assistant-eye" x="24.7862" y="50.2578" width="37.1826" height="37.1826" fill="black" />
				<rect className="wc-assistant-eye" x="82.1482" y="50.2578" width="37.1828" height="37.1826" fill="black" />
			</mask>
			<path d="M144.14 144.14H0V55.4038L54.8342 0H144.14V144.14Z" mask={`url(#${maskId})`} />
		</svg>
	);
}
