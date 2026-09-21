#!/usr/bin/env node

import {createHash} from "node:crypto";
import {readFile, writeFile} from "node:fs/promises";
import process from "node:process";
import {pathToFileURL} from "node:url";

function usage() {
	return "Usage: pnpm audit:runtime -- --url <app-url> --plan <plan.json> --out <evidence.json>";
}

function parseArgs(argv) {
	const values = {};
	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (!argument.startsWith("--")) continue;
		const key = argument.slice(2);
		const value = argv[index + 1];
		if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}.`);
		values[key] = value;
		index += 1;
	}
	if (!values.url || !values.plan || !values.out) throw new Error(usage());
	return values;
}

function applicationContract(plan) {
	return plan.applicationContract ?? plan.artifactContract;
}

function plannedRoutes(plan) {
	return applicationContract(plan)?.routes ?? [];
}

function routePath(route) {
	return route.path ?? route.route ?? route.id;
}

function plannedInteractions(route) {
	const direct = route.interactions ?? [];
	const regional = (route.regions ?? []).flatMap((region) => region.interactions ?? []);
	return [...direct, ...regional].map((interaction) =>
		typeof interaction === "string" ? {id: interaction} : interaction,
	);
}

async function exerciseInteraction(page, interaction) {
	if (!interaction?.id) return undefined;
	try {
		const selector = interaction.selector ?? `[data-wakecore-interaction=${JSON.stringify(interaction.id)}]`;
		const target = page.locator(selector).first();
		await target.waitFor({state: "visible", timeout: 3_000});
		if (interaction.action === "fill") await target.fill(interaction.value ?? "WakeCore audit");
		else if (interaction.action === "check") await target.check();
		else if (interaction.action === "press") await target.press(interaction.value ?? "Enter");
		else await target.click();
		return {id: interaction.id, passed: true};
	} catch {
		return {id: interaction.id, passed: false};
	}
}

async function pageMetadata(page, domPersistent) {
	const metadata = await page.evaluate((persistent) => {
		const value = (selector, attribute) => {
			const node = document.querySelector(selector);
			return node?.getAttribute(attribute) ?? node?.textContent?.trim() ?? undefined;
		};
		const shell = document.querySelector("[data-wakecore-shell]");
		const sidebar = document.querySelector('[data-wakecore-sidebar], [data-wakecore-artifact="core-app-sidebar"]');
		const topBar = document.querySelector('[data-wakecore-top-bar], [data-wakecore-artifact="core-app-top-bar"]');
		const footer = shell?.querySelector("[data-wakecore-shell-footer]");
		const density = (node) =>
			node?.getAttribute("data-wakecore-density") ?? node?.getAttribute("data-density") ?? undefined;
		const artifactId = (node, fallback) =>
			node?.getAttribute("data-wakecore-artifact") ?? (node ? fallback : undefined);
		const styleProperties = (node) => {
			if (!node) return undefined;
			const style = getComputedStyle(node);
			return {
				backgroundColor: style.backgroundColor,
				borderBottomWidth: style.borderBottomWidth,
				borderBottomStyle: style.borderBottomStyle,
				borderBottomColor: style.borderBottomColor,
				borderRadius: style.borderRadius,
				color: style.color,
				padding: style.padding,
				fontSize: style.fontSize,
			};
		};
		const regions = [...document.querySelectorAll("[data-wakecore-region]")]
			.map((node) => node.getAttribute("data-wakecore-region"))
			.filter(Boolean);
		const accessibilityErrors = [...document.querySelectorAll("img:not([alt]), button:not([aria-label]):empty")].map(
			(node) => `${node.tagName.toLowerCase()} is missing an accessible label`,
		);
		const visible = (node) => {
			const style = getComputedStyle(node);
			const rect = node.getBoundingClientRect();
			return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
		};
		const artifactNodes = [
			...document.querySelectorAll(
				'[data-wakecore-artifact="core-app-top-bar"], [data-wakecore-artifact="data-table"], [data-wakecore-artifact*="chart"], [data-wakecore-artifact*="tab"]',
			),
		];
		if (topBar && !artifactNodes.includes(topBar)) artifactNodes.push(topBar);
		const purposeCounts = new Map();
		for (const node of document.querySelectorAll("[data-wakecore-affordance-purpose], input, textarea")) {
			if (!visible(node)) continue;
			const purpose =
				node.getAttribute("data-wakecore-affordance-purpose") ??
				node.getAttribute("placeholder") ??
				node.getAttribute("aria-label") ??
				node.getAttribute("name");
			if (purpose) purposeCounts.set(purpose, (purposeCounts.get(purpose) ?? 0) + 1);
		}
		const borderVisible = (node, edge) => {
			if (!node) return false;
			const style = getComputedStyle(node);
			return Number.parseFloat(style[`border${edge}Width`]) > 0 && style[`border${edge}Style`] !== "none";
		};
		const duplicateSurfaceBoundaries = [];
		if (topBar) {
			if (topBar.parentElement && borderVisible(topBar.parentElement, "Bottom"))
				duplicateSurfaceBoundaries.push({artifactId: "core-app-top-bar", owner: "parent", edge: "bottom"});
			if (topBar.nextElementSibling && borderVisible(topBar.nextElementSibling, "Top"))
				duplicateSurfaceBoundaries.push({artifactId: "core-app-top-bar", owner: "next-sibling", edge: "top"});
		}
		return {
			shellId: shell?.getAttribute("data-wakecore-shell") ?? "missing",
			sidebar: value("[data-wakecore-sidebar]", "data-wakecore-sidebar"),
			topBar: value("[data-wakecore-top-bar]", "data-wakecore-top-bar"),
			shellFingerprint: {
				shellId: shell?.getAttribute("data-wakecore-shell") ?? "missing",
				sidebarArtifactId: artifactId(sidebar, "core-app-sidebar"),
				topBarArtifactId: artifactId(topBar, "core-app-top-bar"),
				density: shell?.getAttribute("data-wakecore-density") ?? undefined,
				sidebarDensity: density(sidebar),
				topBarDensity: density(topBar),
				brandKey:
					shell?.getAttribute("data-wakecore-brand") ?? sidebar?.getAttribute("data-wakecore-brand") ?? undefined,
				navigationFingerprint: sidebar?.getAttribute("data-wakecore-navigation-fingerprint") ?? undefined,
				footerFingerprint: footer?.getAttribute("data-wakecore-footer-fingerprint") ?? undefined,
				providerOwner: shell?.getAttribute("data-wakecore-provider-owner") ?? undefined,
				domPersistent: persistent,
			},
			navigationMaterial: sidebar
				? [...sidebar.querySelectorAll("a,button")].map((node) => ({
						label: node.textContent?.trim() ?? "",
						target: node.getAttribute("href") ?? node.getAttribute("data-item-id") ?? "",
					}))
				: [],
			footerMaterial: footer?.textContent?.trim() ?? "",
			ownedStyles: artifactNodes.map((node) => ({
				artifactId: artifactId(node, node === topBar ? "core-app-top-bar" : "unknown"),
				region: node.getAttribute("data-wakecore-region") ?? (node === topBar ? "shell.top-bar" : undefined),
				variant: node.getAttribute("data-wakecore-variant") ?? undefined,
				surface: node.getAttribute("data-wakecore-surface") ?? undefined,
				properties: styleProperties(node),
			})),
			duplicateAffordances: [...purposeCounts].map(([purpose, count]) => ({purpose, count})),
			duplicateSurfaceBoundaries,
			canvasCapabilities: [...document.querySelectorAll("[data-wakecore-canvas-capabilities]")].map((node) => ({
				region: node.closest("[data-wakecore-region]")?.getAttribute("data-wakecore-region") ?? "canvas",
				capabilities: (node.getAttribute("data-wakecore-canvas-capabilities") ?? "")
					.split(",")
					.map((value) => value.trim())
					.filter(Boolean),
				observableStateChanged: node.getAttribute("data-wakecore-observable-state-changed") === "true",
			})),
			navigationAffordances: [...document.querySelectorAll("[data-wakecore-navigation-purpose]")]
				.filter(visible)
				.map((node) => ({
					purpose: node.getAttribute("data-wakecore-navigation-purpose") ?? "unknown",
					relationship: node.getAttribute("data-wakecore-navigation-relationship") ?? "unknown",
					destination:
						node.getAttribute("href") ?? node.getAttribute("data-wakecore-navigation-destination") ?? undefined,
				})),
			title: value("[data-wakecore-title], main h1", "data-wakecore-title"),
			mainAction: value("[data-wakecore-main-action]", "data-wakecore-main-action"),
			regions,
			accessibilityErrors,
		};
	}, domPersistent);
	metadata.shellGeometry = await page.evaluate(async () => {
		const shell = document.querySelector("[data-wakecore-shell]");
		const sidebar = document.querySelector('[data-wakecore-sidebar], [data-wakecore-artifact="core-app-sidebar"]');
		const topBar = document.querySelector('[data-wakecore-top-bar], [data-wakecore-artifact="core-app-top-bar"]');
		const content = document.querySelector(
			'[data-wakecore-content-scroll], [data-wakecore-scroll-owner="route-content"]',
		);
		const shellRect = shell?.getBoundingClientRect();
		const sidebarBefore = sidebar?.getBoundingClientRect();
		const topBarRect = topBar?.getBoundingClientRect();
		const contentRect = content?.getBoundingClientRect();
		const contentBefore = content?.scrollTop ?? 0;
		const documentBefore = window.scrollY;
		if (content) content.scrollTop += Math.min(160, Math.max(0, content.scrollHeight - content.clientHeight));
		window.scrollBy(0, 160);
		await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
		const sidebarAfter = sidebar?.getBoundingClientRect();
		return {
			viewportHeight: window.innerHeight,
			shellHeight: shellRect?.height ?? 0,
			sidebarRight: sidebarBefore?.right ?? 0,
			topBarLeft: topBarRect?.left ?? 0,
			contentLeft: contentRect?.left ?? 0,
			sidebarPositionDelta: (sidebarAfter?.top ?? 0) - (sidebarBefore?.top ?? 0),
			contentScrollRange: content ? Math.max(0, content.scrollHeight - content.clientHeight) : 0,
			contentScrollDelta: (content?.scrollTop ?? 0) - contentBefore,
			documentScrollDelta: window.scrollY - documentBefore,
		};
	});
	if (!metadata.shellFingerprint.navigationFingerprint && metadata.navigationMaterial.length)
		metadata.shellFingerprint.navigationFingerprint = createHash("sha256")
			.update(JSON.stringify(metadata.navigationMaterial))
			.digest("hex")
			.slice(0, 16);
	if (!metadata.shellFingerprint.footerFingerprint && metadata.footerMaterial)
		metadata.shellFingerprint.footerFingerprint = createHash("sha256")
			.update(metadata.footerMaterial)
			.digest("hex")
			.slice(0, 16);
	delete metadata.navigationMaterial;
	delete metadata.footerMaterial;
	return metadata;
}

async function auditResponsiveViewports(page) {
	const viewports = [
		{name: "desktop", width: 1440, height: 900},
		{name: "narrow", width: 820, height: 900},
	];
	const audits = [];
	for (const viewport of viewports) {
		await page.setViewportSize({width: viewport.width, height: viewport.height});
		await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
		const audit = await page.evaluate(() => {
			const visible = (node) => {
				const style = getComputedStyle(node);
				const rect = node.getBoundingClientRect();
				return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
			};
			const rectOf = (node) => {
				const rect = node.getBoundingClientRect();
				return {left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height};
			};
			const groups = [...document.querySelectorAll("[data-wakecore-responsive-group]")]
				.filter(visible)
				.map((node) => ({
					id: node.getAttribute("data-wakecore-responsive-group") ?? "unknown",
					priority: node.getAttribute("data-wakecore-responsive-priority") ?? undefined,
					...rectOf(node),
				}));
			const overlaps = [];
			for (let left = 0; left < groups.length; left += 1)
				for (let right = left + 1; right < groups.length; right += 1) {
					const a = groups[left];
					const b = groups[right];
					const intersects = a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
					if (intersects) overlaps.push({first: a.id, second: b.id});
				}
			const splitGroups = [...document.querySelectorAll("[data-wakecore-responsive-atomic]")]
				.filter(visible)
				.flatMap((node) => {
					const children = [...node.children].filter(visible);
					const centers = children.map((child) => {
						const rect = child.getBoundingClientRect();
						return rect.top + rect.height / 2;
					});
					const split = centers.length > 1 && Math.max(...centers) - Math.min(...centers) > 3;
					return split
						? [node.getAttribute("data-wakecore-responsive-group") ?? "unnamed-atomic-group"]
						: [];
				});
			const unlabeledIconActions = [...document.querySelectorAll("button")]
				.filter(visible)
				.filter((node) => {
					const text = node.textContent?.trim() ?? "";
					const label = node.getAttribute("aria-label") ?? node.getAttribute("title") ?? "";
					return !text && !label && Boolean(node.querySelector("svg"));
				})
				.map((node) => node.outerHTML.slice(0, 180));
			return {
				horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
				groups,
				overlaps,
				splitGroups,
				identityWidths: groups.filter((group) => /identity|title/i.test(group.id)).map((group) => ({id: group.id, width: group.width})),
				unlabeledIconActions,
			};
		});
		audits.push({...viewport, ...audit});
	}
	await page.setViewportSize({width: 1440, height: 900});
	return audits;
}

export async function auditRuntime({baseUrl, plan, chromium}) {
	const browser = await chromium.launch({headless: true});
	const context = await browser.newContext({viewport: {width: 1440, height: 900}});
	const page = await context.newPage();
	const results = [];
	try {
		for (const route of plannedRoutes(plan)) {
			const errors = [];
			page.removeAllListeners("console");
			page.on("console", (message) => {
				if (message.type() === "error") errors.push(message.text());
			});
			let reloadDetected = false;
			const navigation = (request) => {
				if (request.isNavigationRequest() && request.frame() === page.mainFrame() && page.url() !== "about:blank")
					reloadDetected = true;
			};
			page.on("request", navigation);
			const target = new URL(routePath(route), baseUrl).href;
			const previousShell = await page
				.locator("[data-wakecore-shell]")
				.elementHandle()
				.catch(() => null);
			if (page.url() === "about:blank") {
				await page.goto(target, {waitUntil: "networkidle"});
				reloadDetected = false;
			} else {
				const path = new URL(target).pathname;
				const routeLink = page.locator(`[data-wakecore-route-link][href=${JSON.stringify(path)}]`).first();
				if ((await routeLink.count()) > 0) {
					await routeLink.click();
					await page.waitForURL(target, {timeout: 5_000}).catch(() => undefined);
					await page.waitForLoadState("networkidle").catch(() => undefined);
				} else {
					await page.goto(target, {waitUntil: "networkidle"});
					reloadDetected = true;
				}
			}
			const domPersistent = previousShell
				? await previousShell
						.evaluate((node) => node === document.querySelector("[data-wakecore-shell]"))
						.catch(() => false)
				: true;
			const responsiveAudits = await auditResponsiveViewports(page);
			const metadata = await pageMetadata(page, domPersistent);
			const interactions = [];
			for (const interaction of plannedInteractions(route)) {
				const result = await exerciseInteraction(page, interaction);
				if (result) interactions.push(result);
			}
			let historyBackPassed = true;
			const historyProbeSelector = route.historyProbeSelector ?? "[data-wakecore-route-link]";
			if ((await page.locator(historyProbeSelector).count()) > 0) {
				const before = page.url();
				try {
					await page.locator(historyProbeSelector).first().click();
					await page.goBack({waitUntil: "networkidle"});
					historyBackPassed = page.url() === before;
				} catch {
					historyBackPassed = false;
				}
			}
			page.off("request", navigation);
			results.push({
				route: route.id ?? route.route ?? route.path,
				...metadata,
				responsiveAudits,
				interactions,
				historyBackPassed,
				reloadDetected,
				consoleErrors: errors,
			});
		}
	} finally {
		await browser.close();
	}
	return results;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const plan = JSON.parse(await readFile(args.plan, "utf8"));
	const {chromium} = await import("playwright");
	const routes = await auditRuntime({baseUrl: args.url, plan, chromium});
	const generatedAt = new Date().toISOString();
	const evidence = {
		producer: "wakecore-runtime-audit/4",
		version: "4",
		planId: plan.planId,
		generatedAt,
		routes,
	};
	evidence.evidenceHash = createHash("sha256").update(JSON.stringify(evidence)).digest("hex");
	await writeFile(args.out, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
	process.stdout.write(`Audited ${routes.length} route(s); evidence written to ${args.out}.\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
	main().catch((error) => {
		process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
		process.exitCode = 1;
	});
