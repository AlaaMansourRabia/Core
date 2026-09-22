// CSS custom-property provenance analysis. A usage receives Core token credit
// only when every authored alias chain terminates in a documented core-token name.

import {isKnownCoreToken} from "./token-catalog.mjs";

const VAR_RE = /var\(\s*(--[\w-]+)/g;
const TOKEN_PROPERTY_RE =
	/^(?:color|background(?:-color)?|border(?:-[a-z]+)?-color|outline-color|fill|stroke|margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left|font-size|font-weight|line-height|letter-spacing|border-radius|box-shadow|text-shadow)(?:-[a-z]+)?$/i;

export function isRecognizedCoreToken(name) {
	return isKnownCoreToken(name);
}

function lineAt(content, offset) {
	return content.slice(0, offset).split(/\r?\n/).length;
}

function collectDefinitions(files) {
	const definitions = new Map();
	for (const file of files) {
		const re = /(--[\w-]+)\s*:\s*([^;{}]+)\s*;?/g;
		let match;
		while ((match = re.exec(file.content)) !== null) {
			const definition = {
				name: match[1],
				value: match[2].trim(),
				path: file.path,
				line: lineAt(file.content, match.index),
			};
			const existing = definitions.get(definition.name) ?? [];
			existing.push(definition);
			definitions.set(definition.name, existing);
		}
	}
	return definitions;
}

function references(value) {
	return [...value.matchAll(VAR_RE)].map((match) => match[1]);
}

function resolveName(name, definitions, trail = []) {
	if (trail.includes(name)) return {status: "cyclic", chain: [...trail, name], terminalTokens: []};
	const authored = definitions.get(name);
	if (!authored?.length)
		return isRecognizedCoreToken(name)
			? {status: "core-token", chain: [...trail, name], terminalTokens: [name]}
			: {status: "unresolved", chain: [...trail, name], terminalTokens: []};

	const resolutions = authored.map((definition) => {
		const refs = references(definition.value);
		if (!refs.length) return {status: "literal-backed", chain: [...trail, name], terminalTokens: [], definition};
		const targets = refs.map((ref) => resolveName(ref, definitions, [...trail, name]));
		const failure = targets.find((target) => target.status !== "core-token");
		return (
			failure ?? {
				status: "core-token",
				chain: [...trail, name, ...targets.flatMap((target) => target.chain.slice(-1))],
				terminalTokens: [...new Set(targets.flatMap((target) => target.terminalTokens ?? []))],
			}
		);
	});
	return resolutions.find((resolution) => resolution.status !== "core-token") ?? resolutions[0];
}

export function analyzeTokenProvenance(files) {
	const definitions = collectDefinitions(files);
	const usages = [];
	const issues = [];
	for (const file of files) {
		const declarationRe = /([\w-]+)\s*:\s*([^;{}]+)\s*;?/g;
		let declaration;
		while ((declaration = declarationRe.exec(file.content)) !== null) {
			if (declaration[1].startsWith("--")) continue;
			if (!TOKEN_PROPERTY_RE.test(declaration[1])) continue;
			for (const name of references(declaration[2])) {
				const resolution = resolveName(name, definitions);
				const usage = {
					name,
					property: declaration[1],
					path: file.path,
					line: lineAt(file.content, declaration.index),
					status: resolution.status,
					chain: resolution.chain,
					terminalTokens: resolution.terminalTokens ?? [],
				};
				usages.push(usage);
				if (resolution.status !== "core-token") issues.push(usage);
			}
		}
	}

	const authoredDefinitions = [...definitions.values()].flat().map((definition) => {
		const resolution = resolveName(definition.name, definitions);
		return {
			...definition,
			status: resolution.status,
			chain: resolution.chain,
			terminalTokens: resolution.terminalTokens ?? [],
		};
	});
	const byStatus = {};
	for (const usage of usages) byStatus[usage.status] = (byStatus[usage.status] ?? 0) + 1;
	return {
		definitions: authoredDefinitions,
		usages,
		issues,
		summary: {
			total: usages.length,
			valid: usages.filter((usage) => usage.status === "core-token").length,
			invalid: issues.length,
			byStatus,
			score: usages.length ? Number(((usages.length - issues.length) / usages.length).toFixed(4)) : 1,
		},
	};
}
