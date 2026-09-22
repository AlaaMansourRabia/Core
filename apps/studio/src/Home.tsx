import {Input} from "@corensystem/core-ui/input";
import {Layers, RefreshCw, Search} from "lucide-react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {formatTemplateName, loadCatalog, type Catalog} from "./lib/catalog";
import {clearPreviewCache} from "./lib/preview";
import {TemplateThumb} from "./TemplateThumb";

// Home is the read-only front door: search and browse the canonical Core catalog. There is no
// prompt composer, no model picker, no attachments, no chat — Studio previews official Core only.
export function Home({onOpen}: {onOpen: (templateId: string) => void}) {
	const [catalog, setCatalog] = useState<Catalog | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const versionRef = useRef<string | null>(null);

	// Re-read the CANONICAL catalog. When its version changes (approved changes merged + regenerated), the
	// preview cache is dropped so thumbnails re-render the new canonical. This reflects the repository, not
	// any workspace — there is no workspace watching here.
	const reflect = useCallback(async () => {
		try {
			const next = await loadCatalog();
			if (next.version !== versionRef.current) {
				versionRef.current = next.version;
				clearPreviewCache();
			}
			setCatalog(next);
			setError(null);
		} catch (e) {
			setError(String(e));
		}
	}, []);

	const refresh = useCallback(async () => {
		setRefreshing(true);
		await reflect();
		setRefreshing(false);
	}, [reflect]);

	useEffect(() => {
		void reflect();
		// On the home screen there's no preview context — clear the host's breadcrumb.
		window.parent.postMessage({type: "wc-studio-context", label: null}, "*");
		// Reflect approved changes when the user returns to the tab (lightweight, no polling).
		const onFocus = () => {
			if (document.visibilityState === "visible") void reflect();
		};
		document.addEventListener("visibilitychange", onFocus);
		window.addEventListener("focus", onFocus);
		return () => {
			document.removeEventListener("visibilitychange", onFocus);
			window.removeEventListener("focus", onFocus);
		};
	}, [reflect]);

	// Canonical search — filter templates by name / archetype / intent as the user types.
	const templates = useMemo(() => {
		const all = catalog?.templates ?? [];
		const q = query.trim().toLowerCase();
		if (!q) return all;
		return all.filter((t) =>
			[t.name, formatTemplateName(t.name), t.archetype ?? "", t.intent, t.id].some((f) => f.toLowerCase().includes(q)),
		);
	}, [catalog, query]);

	return (
		<div className="wwc:min-h-full wwc:bg-background wwc:text-foreground">
			<div className="wwc:mx-auto wwc:max-w-5xl wwc:px-6 wwc:pb-24 wwc:pt-6">
				{/* Header — the read-only front door to Core */}
				<div className="wwc:pt-10 wwc:text-center">
					<div className="wwc:mb-4 wwc:flex wwc:items-center wwc:justify-center wwc:gap-2">
						<img src="/core-small.svg" alt="Core" className="wwc:h-12 wwc:w-auto wwc:invert wwc:dark:invert-0" />
						<span className="wwc:rounded-full wwc:border wwc:border-border wwc:px-2 wwc:py-0.5 wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
							Beta
						</span>
					</div>
					<h1 className="wwc:text-2xl wwc:font-semibold">Browse official Core.</h1>
					<p className="wwc:mt-2 wwc:text-sm wwc:text-muted-foreground">
						Search and preview the canonical Core catalog — templates, widgets, and components.
					</p>
				</div>

				{/* Canonical template search */}
				<div className="wwc:relative wwc:mx-auto wwc:mt-6 wwc:max-w-2xl">
					<Search className="wwc:pointer-events-none wwc:absolute wwc:left-3 wwc:top-1/2 wwc:size-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search Core templates…"
						className="wwc:h-11 wwc:pl-9"
						aria-label="Search Core templates"
					/>
				</div>

				{error && (
					<div className="wwc:mt-8 wwc:text-center wwc:text-sm wwc:text-destructive">Couldn't load Core: {error}</div>
				)}

				{/* Templates — canonical cards */}
				<section className="wwc:mt-12">
					<div className="wwc:mb-3 wwc:flex wwc:items-center wwc:justify-between">
						<h2 className="wwc:text-[11px] wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
							Templates
						</h2>
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							{catalog && (
								<span className="wwc:text-xs wwc:text-muted-foreground">
									{query.trim() ? `${templates.length} of ${catalog.counts.templates}` : catalog.counts.templates}
								</span>
							)}
							<button
								onClick={refresh}
								disabled={refreshing}
								title="Re-read canonical Core (approved changes appear after merge)"
								className="wwc:inline-flex wwc:items-center wwc:gap-1 wwc:rounded-md wwc:border wwc:border-border wwc:px-1.5 wwc:py-0.5 wwc:text-xs wwc:text-muted-foreground wwc:hover:bg-muted wwc:disabled:opacity-50"
							>
								<RefreshCw className={`wwc:size-3 ${refreshing ? "wwc:animate-spin" : ""}`} />
								Refresh
							</button>
						</div>
					</div>
					{catalog && templates.length === 0 ? (
						<div className="wwc:rounded-lg wwc:border wwc:border-dashed wwc:border-border wwc:py-12 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
							No templates match “{query}”.
						</div>
					) : (
						<div
							key={catalog?.version}
							className="wwc:grid wwc:grid-cols-2 wwc:gap-3 wwc:sm:grid-cols-3 wwc:lg:grid-cols-4"
						>
							{templates.map((t) => (
								<button
									key={t.id}
									onClick={() => onOpen(t.id)}
									className="wwc:group wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:text-left wwc:transition wwc:hover:border-primary/40 wwc:hover:shadow-sm"
								>
									<TemplateThumb id={t.id} />
									<div className="wwc:border-t wwc:border-border wwc:px-3 wwc:py-2">
										<div className="wwc:truncate wwc:text-sm wwc:font-medium">{formatTemplateName(t.name)}</div>
										<div className="wwc:truncate wwc:text-xs wwc:text-muted-foreground">{t.archetype ?? t.id}</div>
									</div>
								</button>
							))}
						</div>
					)}
				</section>

				{/* The library — what everything is built from (canonical, read-only) */}
				<section className="wwc:mt-12">
					<div className="wwc:mb-3 wwc:flex wwc:items-center wwc:gap-2">
						<Layers className="wwc:size-4 wwc:text-muted-foreground" />
						<h2 className="wwc:text-[11px] wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
							The library
						</h2>
						{catalog && (
							<span className="wwc:text-xs wwc:text-muted-foreground">
								{catalog.counts.widgets} widgets · {catalog.counts.components} components
							</span>
						)}
					</div>
					<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
						{[...(catalog?.widgets ?? []), ...(catalog?.components ?? [])].slice(0, 60).map((n) => (
							<span
								key={n}
								className="wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:px-2 wwc:py-0.5 wwc:text-xs wwc:text-muted-foreground"
							>
								{n}
							</span>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
