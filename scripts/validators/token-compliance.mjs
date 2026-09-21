import {analyzeTokenProvenance} from "./token-provenance.mjs";

const RULES = {
	color: {
		property: /^(?:color|background(?:-color)?|border(?:-[a-z]+)?-color|outline-color|fill|stroke)$/i,
		literal: /#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch|oklab)a?\([^)]*\)/gi,
	},
	spacing: {
		property: /^(?:margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left)(?:-[a-z]+)?$/i,
		literal: /(?:^|\s)-?(?!0(?:\D|$))\d*\.?\d+(?:px|rem|em|vh|vw|ch|%)\b/gi,
	},
	typography: {
		property: /^(?:font-size|font-weight|line-height|letter-spacing)$/i,
		literal: /(?:^|\s)(?:[1-9]\d*(?:\.\d+)?(?:px|rem|em|%)?|\d*\.\d+)\b/gi,
	},
	radius: {property: /^border-radius$/i, literal: /(?:^|\s)(?!0(?:\D|$))\d*\.?\d+(?:px|rem|em|%)\b/gi},
	shadow: {property: /^(?:box-shadow|text-shadow)$/i, literal: /(?:^|\s)-?\d*\.?\d+(?:px|rem|em)\b/gi},
};

const EXCEPTION_RE = /\/\*\s*wakecore-token-exception\s*:\s*([^*]+?)\s*\*\//i;

export function analyzeTokenCompliance(files) {
	const provenance = analyzeTokenProvenance(files);
	const hardCoded = [];
	const exceptions = [];
	const declarations = Object.fromEntries(Object.keys(RULES).map((key) => [key, 0]));
	const tokenized = Object.fromEntries(Object.keys(RULES).map((key) => [key, 0]));
	const invalidVariables = [];

	for (const file of files) {
		const lines = file.content.split(/\r?\n/);
		let pendingException = null;
		for (let index = 0; index < lines.length; index += 1) {
			const line = lines[index];
			const annotation = line.match(EXCEPTION_RE);
			if (annotation) pendingException = {reason: annotation[1].trim(), line: index + 1};
			const declarationRe = /([\w-]+)\s*:\s*([^;{}]+)\s*;?/g;
			let declaration;
			while ((declaration = declarationRe.exec(line.replace(EXCEPTION_RE, ""))) !== null) {
				const [, property, value] = declaration;
				if (property.startsWith("--")) continue;
				for (const [category, rule] of Object.entries(RULES)) {
					if (!rule.property.test(property)) continue;
					declarations[category] += 1;
					const usages = provenance.usages.filter(
						(item) => item.path === file.path && item.line === index + 1 && item.property === property,
					);
					if (usages.length && usages.every((usage) => usage.status === "wakecore-token")) {
						tokenized[category] += 1;
						continue;
					}
					const invalidUsages = usages.filter((usage) => usage.status !== "wakecore-token");
					invalidVariables.push(...invalidUsages.map((usage) => ({...usage, category})));
					const literals = [...value.matchAll(rule.literal)].map((match) => match[0].trim()).filter(Boolean);
					if (!literals.length && !invalidUsages.length) continue;
					const values = literals.length ? literals : invalidUsages.map((usage) => `var(${usage.name})`);
					if (pendingException?.reason?.length >= 4) {
						exceptions.push({category, path: file.path, line: index + 1, values, reason: pendingException.reason});
						pendingException = null;
					} else {
						for (const literal of values)
							hardCoded.push({
								category,
								path: file.path,
								line: index + 1,
								property,
								value: literal,
								provenance: invalidUsages[0]?.status,
							});
					}
				}
			}
			if (
				pendingException &&
				index + 1 > pendingException.line &&
				line.trim() &&
				!line.includes("wakecore-token-exception")
			)
				pendingException = null;
		}
	}

	const categories = {};
	for (const category of Object.keys(RULES)) {
		const violations = hardCoded.filter((item) => item.category === category).length;
		const eligible = tokenized[category] + violations;
		categories[category] = {
			score: eligible === 0 ? 1 : Number((tokenized[category] / eligible).toFixed(4)),
			declarations: declarations[category],
			tokenized: tokenized[category],
			violations,
		};
	}
	const totalTokenized = Object.values(categories).reduce((sum, item) => sum + item.tokenized, 0);
	const totalViolations = hardCoded.length;
	return {
		categories,
		overall: {
			score:
				totalTokenized + totalViolations === 0
					? 1
					: Number((totalTokenized / (totalTokenized + totalViolations)).toFixed(4)),
			tokenized: totalTokenized,
			violations: totalViolations,
		},
		hardCoded,
		exceptions,
		invalidVariables,
		provenance,
	};
}
