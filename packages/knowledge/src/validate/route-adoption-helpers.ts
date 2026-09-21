export interface SourceFile {
	path: string;
	content: string;
}

export interface RouteRegionSpec {
	id: string;
	role?: string;
	artifacts: string[];
	catalogGapId?: string;
}

export interface RouteSpec {
	id: string;
	path?: string;
	component?: string;
	files: string[];
	shell: boolean;
	moduleBoundaryId?: string;
	regions: RouteRegionSpec[];
}

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
	value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;

const strings = (value: unknown): string[] => {
	if (typeof value === "string") return value ? [value] : [];
	if (!Array.isArray(value)) return [];
	return value.flatMap((item) => {
		if (typeof item === "string") return item ? [item] : [];
		const record = asRecord(item);
		const candidate = record?.id ?? record?.artifactId ?? record?.name ?? record?.export;
		return typeof candidate === "string" && candidate ? [candidate] : [];
	});
};

const firstString = (...values: unknown[]): string | undefined =>
	values.find((value): value is string => typeof value === "string" && value.length > 0);

export function normalizeRouteSpecs(planValue: unknown): RouteSpec[] {
	const plan = asRecord(planValue);
	const contract = asRecord(plan?.artifactContract);
	const candidates = [contract?.routes, contract?.routeContracts, plan?.routes].find(Array.isArray);
	if (!Array.isArray(candidates)) return [];
	return candidates.flatMap((candidate, index) => {
		const route = asRecord(candidate);
		if (!route) return [];
		const path = firstString(route.path, route.route, route.pathname);
		const id = firstString(route.id, route.routeId, route.name, path) ?? `route-${index + 1}`;
		const moduleBoundary = asRecord(route.moduleBoundary);
		const files = [
			...strings(route.files),
			...strings(route.file),
			...strings(route.module),
			...strings(route.source),
			...strings(moduleBoundary?.files),
			...strings(moduleBoundary?.file),
		];
		const regionValues = [route.regions, route.ownedRegions].find(Array.isArray);
		const regions = Array.isArray(regionValues)
			? regionValues.flatMap((value, regionIndex) => {
					const region = asRecord(value);
					if (!region) return [];
					const regionId = firstString(region.id, region.regionId, region.name) ?? `region-${regionIndex + 1}`;
					return [
						{
							id: regionId,
							role: firstString(region.role, region.intent, region.purpose),
							artifacts: [
								...strings(region.artifacts),
								...strings(region.required),
								...strings(region.requiredArtifacts),
								...strings(region.recommended),
								...strings(region.recommendedArtifacts),
								...strings(region.acceptableArtifacts),
								...strings(region.fallbackOrder),
								...strings(region.expectedArtifacts),
							],
							catalogGapId: firstString(region.catalogGapId),
						},
					];
				})
			: [];
		return [
			{
				id,
				path,
				component: firstString(route.component, route.element, moduleBoundary?.component),
				files: [...new Set(files)],
				shell: route.shell !== false && route.usesShell !== false && route.layout !== "standalone",
				moduleBoundaryId: firstString(route.moduleBoundaryId, moduleBoundary?.id),
				regions,
			},
		];
	});
}

function normalizePath(value: string): string {
	return value
		.replaceAll("\\", "/")
		.replace(/^\.\//, "")
		.replace(/\.(?:tsx?|jsx?)$/, "");
}

function localImports(file: SourceFile, files: SourceFile[]): SourceFile[] {
	const imports = [...file.content.matchAll(/(?:import|export)\s+[\s\S]*?from\s+["'](\.[^"']+)["']/g)].map(
		(match) => match[1],
	);
	const base = file.path.split("/").slice(0, -1);
	return imports.flatMap((specifier) => {
		const segments = [...base, ...specifier.split("/")];
		const resolved: string[] = [];
		for (const segment of segments) {
			if (segment === "." || segment === "") continue;
			if (segment === "..") resolved.pop();
			else resolved.push(segment);
		}
		const target = normalizePath(resolved.join("/"));
		return files.filter((candidate) => {
			const path = normalizePath(candidate.path);
			return path === target || path === `${target}/index`;
		});
	});
}

export function filesForRoute(route: RouteSpec, files: SourceFile[]): SourceFile[] {
	const explicit = new Set(route.files.map(normalizePath));
	let roots = files.filter((file) => explicit.has(normalizePath(file.path)));
	if (roots.length === 0 && route.component) {
		const name = route.component.replace(/[<>{}/\s]/g, "");
		roots = files.filter(
			(file) =>
				new RegExp(`(?:function|class|const)\\s+${escapeRegExp(name)}\\b`).test(file.content) ||
				new RegExp(`export\\s+default\\s+(?:function\\s+)?${escapeRegExp(name)}\\b`).test(file.content),
		);
	}
	if (roots.length === 0 && route.path) {
		const pathPattern = new RegExp(`["']${escapeRegExp(route.path)}["']`);
		const routerFiles = files.filter((file) => pathPattern.test(file.content));
		const componentNames = routerFiles.flatMap((file) => {
			const match = file.content.match(
				new RegExp(
					`path\\s*[:=]\\s*["']${escapeRegExp(route.path ?? "")}["'][\\s\\S]{0,250}?(?:element|component)\\s*[:=]\\s*(?:<)?([A-Z][A-Za-z0-9_]*)`,
				),
			);
			return match?.[1] ? [match[1]] : [];
		});
		roots = componentNames.flatMap((name) =>
			files.filter(
				(file) =>
					new RegExp(`(?:function|class|const)\\s+${escapeRegExp(name)}\\b`).test(file.content) ||
					normalizePath(file.path).split("/").at(-1)?.toLowerCase() === name.toLowerCase(),
			),
		);
		if (roots.length === 0) roots = routerFiles;
	}
	if (roots.length === 0) {
		const routeName = route.id.toLowerCase().replace(/[^a-z0-9]/g, "");
		roots = files.filter((file) => {
			const name = normalizePath(file.path)
				.split("/")
				.at(-1)
				?.toLowerCase()
				.replace(/[^a-z0-9]/g, "");
			return name === routeName || name === `${routeName}route` || name === `${routeName}page`;
		});
	}
	const found = new Set(roots);
	const queue = [...roots];
	while (queue.length) {
		const current = queue.shift();
		if (!current) continue;
		for (const dependency of localImports(current, files)) {
			if (found.has(dependency)) continue;
			found.add(dependency);
			queue.push(dependency);
		}
	}
	return [...found];
}

export function hasJsx(source: string, name: string): boolean {
	return new RegExp(`<${escapeRegExp(name)}(?=[\\s/>])`).test(source);
}

export function artifactNames(value: string): string[] {
	const pieces = value.split(/[/.#]/).filter(Boolean);
	const tail = pieces.at(-1) ?? value;
	const pascal = tail
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
	return [...new Set([value, tail, pascal])];
}

export function rendersArtifact(source: string, artifact: string): boolean {
	return artifactNames(artifact).some((name) => hasJsx(source, name));
}

export function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function ratio(numerator: number, denominator: number): number {
	return denominator === 0 ? 1 : Math.round((numerator / denominator) * 100) / 100;
}

export function planRecord(value: unknown): Record<string, unknown> | undefined {
	return asRecord(value);
}
