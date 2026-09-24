import type {ECharts, EChartsOption} from "echarts";

import {cssColorToRgb, getChartColors, getCssVarAsRgb} from "@corensystem/coren-utils";
import * as echarts from "echarts";
import * as React from "react";

import {WidgetCard, WidgetCardActions, WidgetCardBody, WidgetCardHeader, WidgetCardTitle} from "./widget-card";

export type ChartConfig = {
	[k in string]: {
		label?: React.ReactNode;
		icon?: React.ComponentType;
	} & ({color?: string; theme?: never} | {color?: never; theme: Record<"light" | "dark", string>});
};

export type ChartSemanticTone =
	| "primary"
	| "success"
	| "warning"
	| "destructive"
	| "muted"
	| "chart-1"
	| "chart-2"
	| "chart-3"
	| "chart-4"
	| "chart-5";

export type ChartSeriesTheme = {tone: ChartSemanticTone; colorIndex?: never} | {tone?: never; colorIndex: number};

const TONE_VARIABLES: Record<ChartSemanticTone, string> = {
	primary: "--primary",
	success: "--success",
	warning: "--warning",
	destructive: "--destructive",
	muted: "--muted-foreground",
	"chart-1": "--chart-1",
	"chart-2": "--chart-2",
	"chart-3": "--chart-3",
	"chart-4": "--chart-4",
	"chart-5": "--chart-5",
};

const CANVAS_UNSAFE_COLOR = /(?:var\(|oklch\(|oklab\(|lab\(|lch\(|color\()/i;

function themedSeriesColor(theme: ChartSeriesTheme): string {
	if (theme.tone) return getCssVarAsRgb(TONE_VARIABLES[theme.tone]);
	const colors = getChartColors();
	return colors[((theme.colorIndex % colors.length) + colors.length) % colors.length];
}

function normalizeColorValue(value: unknown, key?: string): unknown {
	if (Array.isArray(value)) return value.map((item) => normalizeColorValue(item, key));
	if (value && typeof value === "object")
		return Object.fromEntries(
			Object.entries(value).map(([childKey, childValue]) => [childKey, normalizeColorValue(childValue, childKey)]),
		);
	if (typeof value === "string" && key && /(?:^color$|color$)/i.test(key) && CANVAS_UNSAFE_COLOR.test(value))
		return cssColorToRgb(value);
	return value;
}

/**
 * Returns an ECharts option whose CSS Color 4 values are converted to canvas-safe RGB strings.
 * Optional series themes let consumers use Core semantic tones or palette indexes without
 * reading CSS variables or introducing raw color literals.
 *
 * Colors are resolved against the theme that is live **at call time** — the returned option holds
 * concrete RGB strings, so a memoised result goes stale the moment the theme is switched. Prefer
 * `<ChartContainer seriesThemes={...} />`, which re-resolves them on every theme change; call this
 * directly only when you need the option object itself, and key your memo on {@link useThemeVersion}.
 */
export function createThemedChartOption(option: EChartsOption, seriesThemes: ChartSeriesTheme[] = []): EChartsOption {
	const normalized = normalizeColorValue(option) as EChartsOption;
	if (!seriesThemes.length || !Array.isArray(normalized.series)) return normalized;
	return {
		...normalized,
		series: normalized.series.map((series, index) => {
			const theme = seriesThemes[index];
			if (!theme || !series || typeof series !== "object") return series;
			const color = themedSeriesColor(theme);
			const record = series as Record<string, unknown>;
			return {
				...record,
				lineStyle: {...(record.lineStyle as Record<string, unknown> | undefined), color},
				itemStyle: {...(record.itemStyle as Record<string, unknown> | undefined), color},
			};
		}),
	};
}

/**
 * A counter that changes whenever the live theme does, so anything resolved from a CSS variable can
 * be read again.
 *
 * Every color here comes out of `getComputedStyle(document.documentElement)`, which returns a
 * concrete RGB string for whichever theme was live when it ran. Toggling `.dark` (or `.wwc-invert`,
 * or `data-theme`) on `<html>` swaps the variables underneath but recomputes nothing — a chart
 * memoised on mount keeps painting light-mode colors on a dark card until something invalidates it.
 * That is what this hook is: an attribute observer over `<html>` plus the system-preference media
 * query, both of which mean "read the variables again".
 *
 * Use it as a dependency of any memo that resolves theme colors itself.
 */
export function useThemeVersion(): number {
	const [version, setVersion] = React.useState(0);

	React.useEffect(() => {
		const bump = () => setVersion((current) => current + 1);

		const observer = new MutationObserver(bump);
		observer.observe(document.documentElement, {attributes: true, attributeFilter: ["class", "data-theme"]});

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		media.addEventListener("change", bump);

		return () => {
			observer.disconnect();
			media.removeEventListener("change", bump);
		};
	}, []);

	return version;
}

/**
 * Hook that returns theme-aware colors derived from CSS variables.
 * Returns chart colors (--chart-1 through --chart-5) and common UI colors.
 * Recomputes on every theme change, so an option built from these values is never stale.
 */
export function useChartTheme() {
	const themeVersion = useThemeVersion();

	// The version is taken as an argument rather than closed over: it is a real input here, since
	// every value below reads the live CSS variables and the version is what says they moved.
	return React.useMemo(() => readChartTheme(themeVersion), [themeVersion]);
}

/** Reads the whole palette from the document. The version argument only dates the answer. */
function readChartTheme(_themeVersion: number) {
	return {
		colors: getChartColors(),
		textColor: getCssVarAsRgb("--foreground"),
		mutedColor: getCssVarAsRgb("--muted-foreground"),
		borderColor: getCssVarAsRgb("--border"),
		backgroundColor: getCssVarAsRgb("--background"),
	};
}

type ChartPalette = {textColor: string; mutedColor: string; borderColor: string};

/**
 * Defaults a `color` on a text-ish ECharts node. The caller's own value wins — spreading the
 * existing record last is what makes this a default rather than an override.
 */
function withTextColor(node: unknown, color: string): Record<string, unknown> {
	return {color, ...((node ?? {}) as Record<string, unknown>)};
}

/** The same, for the `lineStyle.color` of an axis line, tick, or gridline. */
function withLineColor(node: unknown, color: string): Record<string, unknown> {
	const record = (node ?? {}) as Record<string, unknown>;
	return {...record, lineStyle: {color, ...((record.lineStyle ?? {}) as Record<string, unknown>)}};
}

function themedAxis(axis: unknown, palette: ChartPalette): unknown {
	if (Array.isArray(axis)) return axis.map((entry) => themedAxis(entry, palette));
	if (!axis || typeof axis !== "object") return axis;
	const record = axis as Record<string, unknown>;
	return {
		...record,
		axisLabel: withTextColor(record.axisLabel, palette.mutedColor),
		axisLine: withLineColor(record.axisLine, palette.borderColor),
		axisTick: withLineColor(record.axisTick, palette.borderColor),
		splitLine: withLineColor(record.splitLine, palette.borderColor),
	};
}

function themedTextNode(node: unknown, color: string): unknown {
	if (Array.isArray(node)) return node.map((entry) => themedTextNode(entry, color));
	if (!node || typeof node !== "object") return node;
	const record = node as Record<string, unknown>;
	return {...record, textStyle: withTextColor(record.textStyle, color)};
}

/**
 * Fills in the chart's own furniture — label text, axis lines, gridlines — from the live theme.
 *
 * Left unset, ECharts falls back to its built-in `#333` text and `#ccc` lines, which are literals
 * and stay put when the page inverts. Anything the option already states is kept, so this only ever
 * colors what the caller left to chance. Axes absent from the option are not invented.
 */
function withThemeDefaults(option: EChartsOption): EChartsOption {
	if (typeof document === "undefined") return option;

	const palette: ChartPalette = {
		textColor: getCssVarAsRgb("--foreground"),
		mutedColor: getCssVarAsRgb("--muted-foreground"),
		borderColor: getCssVarAsRgb("--border"),
	};
	const record = option as Record<string, unknown>;
	const themed: Record<string, unknown> = {...record, textStyle: withTextColor(record.textStyle, palette.textColor)};

	if (record.xAxis) themed.xAxis = themedAxis(record.xAxis, palette);
	if (record.yAxis) themed.yAxis = themedAxis(record.yAxis, palette);
	if (record.radiusAxis) themed.radiusAxis = themedAxis(record.radiusAxis, palette);
	if (record.angleAxis) themed.angleAxis = themedAxis(record.angleAxis, palette);
	if (record.legend) themed.legend = themedTextNode(record.legend, palette.mutedColor);
	if (record.title) themed.title = themedTextNode(record.title, palette.textColor);

	return themed as EChartsOption;
}

interface ChartContainerProps {
	config?: ChartConfig;
	option: EChartsOption;
	/**
	 * Core semantic tones or palette indexes applied to `option.series` in order. Prefer this over
	 * calling {@link createThemedChartOption} yourself: the colors are resolved here, on every theme
	 * change, so the series survive a switch to dark mode.
	 */
	seriesThemes?: ChartSeriesTheme[];
	className?: string;
	style?: React.CSSProperties;
	height?: number | string;
	onEvents?: Record<string, (params: unknown) => void>;
	/** When set, the chart is framed in a WidgetCard with this name in the grey header band. */
	title?: React.ReactNode;
	/** Right-aligned header slot (info icon, menu, ...). Only rendered alongside a `title`. */
	actions?: React.ReactNode;
	/** Headline figure rendered above the chart, inside the card body. */
	value?: React.ReactNode;
}

/**
 * ECharts wrapper that manages its own instance to prevent hover/tooltip issues.
 * Uses echarts directly instead of echarts-for-react to avoid re-render problems.
 * Passing `title` frames the chart in the shared analytics container (grey header band + body).
 *
 * Colors are re-resolved and re-applied on every theme change, not only when `option` changes
 * identity — a memoised option is the normal thing for a caller to pass, and it must not freeze the
 * chart in the theme it was first painted in.
 */
const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
	({config: _config, option, seriesThemes, className, style, height, onEvents, title, actions, value}, ref) => {
		const chartRef = React.useRef<HTMLDivElement>(null);
		const instanceRef = React.useRef<ECharts | null>(null);
		const themeVersion = useThemeVersion();

		// Initialize chart on mount
		React.useEffect(() => {
			if (!chartRef.current) return;

			const instance = echarts.init(chartRef.current);
			instanceRef.current = instance;

			// Bind events
			if (onEvents) {
				for (const [event, handler] of Object.entries(onEvents)) {
					instance.on(event, handler as (...args: unknown[]) => void);
				}
			}

			// Handle resize
			const observer = new ResizeObserver(() => {
				instance.resize();
			});
			observer.observe(chartRef.current);

			return () => {
				observer.disconnect();
				instance.dispose();
				instanceRef.current = null;
			};
		}, []);

		// A caller writing `seriesThemes={[{tone: "primary"}]}` inline hands us a new array every render;
		// its contents are what matter, so the effect keys on those and reads the latest array by ref.
		const seriesThemesRef = React.useRef(seriesThemes);
		seriesThemesRef.current = seriesThemes;
		const seriesThemesKey = JSON.stringify(seriesThemes ?? []);

		// Update option without destroying chart — on a new option, and on a theme change.
		React.useEffect(() => {
			if (instanceRef.current) {
				const themed = withThemeDefaults(createThemedChartOption(option, seriesThemesRef.current));
				instanceRef.current.setOption(themed, {notMerge: false, lazyUpdate: true});
			}
		}, [option, seriesThemesKey, themeVersion]);

		// Merge refs
		React.useImperativeHandle(ref, () => chartRef.current!, []);

		const chartStyle: React.CSSProperties = {
			...style,
			height: height ?? style?.height ?? 300,
			width: "100%",
		};

		const canvas = <div ref={chartRef} style={chartStyle} />;

		if (title === undefined) {
			return <div className={className}>{canvas}</div>;
		}

		return (
			<WidgetCard className={className}>
				<WidgetCardHeader>
					<WidgetCardTitle>{title}</WidgetCardTitle>
					{actions && <WidgetCardActions>{actions}</WidgetCardActions>}
				</WidgetCardHeader>
				<WidgetCardBody>
					{value !== undefined && <div className="wwc:text-3xl wwc:font-semibold wwc:tracking-tight">{value}</div>}
					{canvas}
				</WidgetCardBody>
			</WidgetCard>
		);
	},
);
ChartContainer.displayName = "ChartContainer";

export {ChartContainer};
