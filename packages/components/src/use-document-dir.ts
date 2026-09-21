import * as React from "react";

/**
 * The host document's text direction — `"ltr"` or `"rtl"` — kept in sync as the host swaps locales at
 * runtime (`<html dir>` / `lang` toggles) via a `MutationObserver`. SSR-safe: resolves to `"ltr"` when
 * there is no `document`.
 *
 * Reach for this when a component needs the ambient direction in JS rather than CSS — most often to hand
 * it to a primitive that would otherwise pin itself `"ltr"`. Radix's `ScrollArea`, for example, stamps an
 * explicit `dir` on its root and falls back to `"ltr"` when it finds neither a `dir` prop nor a
 * `DirectionProvider`; that hard value halts inheritance and pins its subtree LTR inside an RTL host, so
 * threading `useDocumentDir()` into its `dir` prop makes it follow the document again.
 */
export function useDocumentDir(): "ltr" | "rtl" {
	const [dir, setDir] = React.useState<"ltr" | "rtl">(() =>
		typeof document !== "undefined" && getComputedStyle(document.documentElement).direction === "rtl" ? "rtl" : "ltr",
	);
	React.useEffect(() => {
		if (typeof document === "undefined") return;
		const root = document.documentElement;
		const sync = () => setDir(getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr");
		sync();
		const observer = new MutationObserver(sync);
		observer.observe(root, {attributes: true, attributeFilter: ["dir", "lang"]});
		return () => observer.disconnect();
	}, []);
	return dir;
}
