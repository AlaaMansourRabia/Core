import {type ClassValue, clsx} from "clsx";
import {extendTailwindMerge} from "tailwind-merge";

const twMerge = extendTailwindMerge({
	prefix: "wwc",
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Converts a CSS color (including OKLCH) to RGB format that ECharts can understand.
 * Uses a temporary DOM element to leverage browser's color conversion.
 */
export function cssColorToRgb(cssColor: string): string {
	if (typeof document === "undefined") return cssColor;
	for (const match of cssColor.matchAll(/var\(\s*(--[\w-]+)/g)) {
		if (!getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim())
			console.warn(`[Core chart] Unresolved CSS color token ${match[1]}; falling back to currentColor.`);
	}
	const temp = document.createElement("div");
	temp.style.color = cssColor;
	if (!temp.style.color) return cssColor;
	temp.style.display = "none";
	document.body.appendChild(temp);
	const computedColor = getComputedStyle(temp).color;
	document.body.removeChild(temp);
	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	const context = canvas.getContext("2d", {willReadFrequently: true});
	if (!context) return computedColor;
	context.clearRect(0, 0, 1, 1);
	context.fillStyle = computedColor;
	context.fillRect(0, 0, 1, 1);
	const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
	return alpha === 255 ? `rgb(${red}, ${green}, ${blue})` : `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`;
}

/**
 * Gets chart colors from CSS variables in a format ECharts can use.
 * Converts OKLCH colors to RGB automatically.
 */
export function getChartColors(): string[] {
	const cssVars = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"];
	if (typeof document === "undefined") return cssVars.map((varName) => `var(${varName})`);
	return cssVars.map((varName) => {
		const cssValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
		return cssColorToRgb(cssValue);
	});
}

/**
 * Gets a single CSS variable value converted to RGB for ECharts.
 */
export function getCssVarAsRgb(varName: string): string {
	if (typeof document === "undefined") return `var(${varName})`;
	const cssValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
	if (!cssValue) {
		console.warn(`[Core chart] Unresolved CSS color token ${varName}; falling back to currentColor.`);
		return cssColorToRgb("currentColor");
	}
	return cssColorToRgb(cssValue);
}

export {cva, type VariantProps} from "class-variance-authority";
