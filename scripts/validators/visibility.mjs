// Conservative source heuristics for rendered components that are certainly hidden
// or effectively unexercised. Runtime visibility remains a browser-audit concern.

export function analyzeVisibility(files) {
	const hidden = [];
	const nearZero = [];
	for (const file of files) {
		const lines = file.content.split(/\r?\n/);
		for (let index = 0; index < lines.length; index += 1) {
			const line = lines[index];
			const tags = [...line.matchAll(/<([A-Z][\w.]*)\b([^>]*)>/g)];
			for (const tag of tags) {
				const component = tag[1];
				const props = tag[2];
				const classValue = props.match(/className\s*=\s*["']([^"']*)["']/)?.[1] ?? "";
				const styleValue = props.match(/style\s*=\s*\{\{([\s\S]*?)\}\}/)?.[1] ?? "";
				const hiddenReasons = [];
				if (/(?:^|\s)(?:hidden|invisible|opacity-0)(?:\s|$)/.test(classValue)) hiddenReasons.push("utility class");
				if (
					/\bdisplay\s*:\s*["']none["']|\bvisibility\s*:\s*["']hidden["']|\bopacity\s*:\s*(?:0|["']0["'])\b/.test(
						styleValue,
					)
				)
					hiddenReasons.push("inline style");
				if (/\bhidden(?:\s|=|$)/.test(props)) hiddenReasons.push("hidden attribute");
				if (hiddenReasons.length)
					hidden.push({component, path: file.path, line: index + 1, reason: hiddenReasons.join(", ")});

				const zeroClass = /(?:^|\s)(?:w-0|h-0|size-0|max-w-0|max-h-0)(?:\s|$)/.test(classValue);
				const tinyStyle = /\b(?:width|height|maxWidth|maxHeight)\s*:\s*(?:["']?(?:0|1|2)(?:px)?["']?)(?:\s|,|$)/.test(
					styleValue,
				);
				if (zeroClass || tinyStyle)
					nearZero.push({
						component,
						path: file.path,
						line: index + 1,
						reason: zeroClass ? "near-zero utility class" : "near-zero inline dimension",
					});
			}
		}
	}
	return {hidden, nearZero, runtimeAuditRequired: true};
}
