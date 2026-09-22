function lineAt(content, offset) {
	return content.slice(0, offset).split(/\r?\n/).length;
}

function record(matches, file, kind) {
	return matches.map((match) => ({kind, path: file.path, line: lineAt(file.content, match.index), evidence: match[0]}));
}

export function analyzeInteractionSemantics(files) {
	const duplicateComposers = [];
	const redundantSurfaceWrappers = [];
	const fabricatedBackNavigation = [];
	const decorativeCanvases = [];
	const duplicateSurfaceBoundaries = [];
	const inactiveGaps = [];

	for (const file of files) {
		const source = file.content;
		const hasCompleteChat = /<CoreAiChat\b/.test(source);
		const composerMatches = [...source.matchAll(/<(?:PromptInput|CoreChatInput)\b/g)];
		if (hasCompleteChat && composerMatches.length)
			duplicateComposers.push(
				...record(composerMatches, file, "complete-chat-plus-composer").map((item) => ({
					...item,
					message: "CoreAiChat already owns message composition; a second composer duplicates the task.",
				})),
			);

		const purposes = new Map();
		for (const match of source.matchAll(/data-core-affordance-purpose=["']([^"']+)["']/g)) {
			const values = purposes.get(match[1]) ?? [];
			values.push(match);
			purposes.set(match[1], values);
		}
		for (const [purpose, matches] of purposes)
			if (matches.length > 1)
				duplicateComposers.push(
					...record(matches.slice(1), file, "duplicate-affordance-purpose").map((item) => ({...item, purpose})),
				);

		for (const match of source.matchAll(/<Card\b[^>]*>[\s\S]{0,600}?<DataTable\b/g))
			redundantSurfaceWrappers.push({
				kind: "data-table-card-wrapper",
				path: file.path,
				line: lineAt(source, match.index),
				evidence: match[0].slice(0, 160),
			});

		for (const match of source.matchAll(/<(?:header|div|section)\b[^>]*className=["'][^"']*(?:border-b|border-bottom)[^"']*["'][^>]*>[\s\S]{0,800}?<CoreAppTopBar\b/g))
			duplicateSurfaceBoundaries.push({
				kind: "core-app-top-bar-duplicate-divider",
				path: file.path,
				line: lineAt(source, match.index),
				evidence: match[0].slice(0, 200),
				message: "CoreAppTopBar owns its bottom divider; the wrapper adds a second surface boundary.",
			});

		for (const match of source.matchAll(/<[A-Za-z][^>]*\bclassName=["']([^"']*)["'][^>]*>/g)) {
			const classes = match[1];
			const hasGap = /(?:^|\s)(?:[\w-]+:)*gap(?:-[xy])?-[\w.[\]-]+(?:\s|$)/.test(classes);
			const isLayout = /(?:^|\s)(?:[\w-]+:)*(?:inline-)?(?:flex|grid)(?:\s|$)/.test(classes);
			if (hasGap && !isLayout)
				inactiveGaps.push({
					kind: "gap-without-layout",
					path: file.path,
					line: lineAt(source, match.index),
					evidence: match[0].slice(0, 200),
					message: "gap utilities require a flex or grid layout on the same element.",
				});
		}

		const backLike = [
			...source.matchAll(/<(?:Button|a|Link)\b[\s\S]{0,300}?(?:ArrowLeft|ChevronLeft|\bBack\b)[\s\S]{0,300}?>/gi),
		];
		for (const match of backLike) {
			const evidence = match[0];
			if (
				/(?:navigate\(\s*-1\s*\)|history\.back|data-core-navigation-relationship=["'](?:parent|drill-in-origin|history)["'])/.test(
					evidence,
				)
			)
				continue;
			fabricatedBackNavigation.push({
				kind: "unproven-back-navigation",
				path: file.path,
				line: lineAt(source, match.index),
				evidence: evidence.slice(0, 200),
			});
		}

		const canvasLike =
			/<(?:ZoomTools|CanvasToolbar)\b/.test(source) && /(?:\babsolute\b|position\s*:\s*["']absolute)/.test(source);
		const functionalCanvas =
			/(?:@xyflow|ReactFlow|onPan\b|onNodeDrag\b|onConnect\b|fitView\b|fitToView\b|onPointerDown\b|data-core-canvas-capabilities=)/.test(
				source,
			);
		if (canvasLike && !functionalCanvas)
			decorativeCanvases.push({
				kind: "decorative-canvas-controls",
				path: file.path,
				line: lineAt(source, source.search(/<(?:ZoomTools|CanvasToolbar)\b/)),
			});
	}

	return {
		duplicateComposers,
		redundantSurfaceWrappers,
		fabricatedBackNavigation,
		decorativeCanvases,
		duplicateSurfaceBoundaries,
		inactiveGaps,
		pass:
			duplicateComposers.length === 0 &&
			redundantSurfaceWrappers.length === 0 &&
			fabricatedBackNavigation.length === 0 &&
			decorativeCanvases.length === 0 &&
			duplicateSurfaceBoundaries.length === 0 &&
			inactiveGaps.length === 0,
	};
}
