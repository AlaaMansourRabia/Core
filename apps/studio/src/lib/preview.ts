// Client side of the canonical preview seam. Given a template id, fetch its canonical source (the Code
// view) and the compiled bundle fed to the Core renderer. Read-only: nothing is written, no session
// is created. Editing happens externally and reaches Studio only after review + merge.

export type PreviewResult = {
	template: {id: string; name: string};
	code: string; // canonical page source (the Code view)
	compiled: string; // esbuild CJS bundle (fed to renderModule)
};

export async function loadPreview(templateId: string): Promise<PreviewResult> {
	const res = await fetch("/api/preview", {
		method: "POST",
		headers: {"content-type": "application/json"},
		body: JSON.stringify({templateId}),
	});
	const data = (await res.json()) as PreviewResult & {error?: string};
	if (!res.ok) throw new Error(data.error || `preview ${res.status}`);
	return data;
}

// Compiled-bundle cache shared across the thumbnail grid (compile once per template id, reuse on re-mount).
// Cleared when the canonical version changes so thumbnails re-render approved template edits.
const compiledCache = new Map<string, Promise<string>>();

export function loadCompiled(templateId: string): Promise<string> {
	let p = compiledCache.get(templateId);
	if (!p) {
		p = loadPreview(templateId)
			.then((r) => r.compiled)
			.catch(() => "");
		compiledCache.set(templateId, p);
	}
	return p;
}

export function clearPreviewCache(): void {
	compiledCache.clear();
}
