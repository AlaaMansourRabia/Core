---
name: core-ui-charts
description: >
  Two chart systems in @wakecap/core-ui. ChartContainer (ECharts wrapper with
  canvas-safe token conversion via createThemedChartOption/useChartTheme) from @wakecap/core-ui/chart.
  ChartRenderer (lightweight ECharts for AI-generated charts, ChartData,
  ChartType: bar/line/area/pie/scatter) from
  @wakecap/core-ui/chat/core-chart-renderer. getCssVarAsRgb and getChartColors
  from @wakecap/core-utils for direct ECharts/canvas consumers.
metadata:
  type: core
  library: wakecore
  library_version: "0.0.1"
sources:
  - "wakecap/Wakecore:packages/components/src/chart.tsx"
  - "wakecap/Wakecore:packages/components/src/chat/core-chart-renderer.tsx"
  - "wakecap/Wakecore:packages/utils/src/index.ts"
  - "wakecap/Wakecore:packages/tokens/src/index.css"
---

# @wakecap/core-ui — Charts

Two chart systems. Choose based on use case:

| Use case                                        | System           | Import                                      |
| ----------------------------------------------- | ---------------- | ------------------------------------------- |
| Custom product charts with design token colours | `ChartContainer` | `@wakecap/core-ui/chart`                    |
| Rendering AI-generated `ChartData` payloads     | `ChartRenderer`  | `@wakecap/core-ui/chat/core-chart-renderer` |
| Direct ECharts or canvas (need RGB from OKLCH)  | utils            | `@wakecap/core-utils`                       |

## Setup

### ChartContainer (ECharts + design tokens)

```tsx
import {ChartContainer, createThemedChartOption, type ChartConfig} from "@wakecap/core-ui/chart";

const chartConfig: ChartConfig = {
	workers: {label: "Workers", color: "var(--chart-1)"},
	visitors: {label: "Visitors", color: "var(--chart-2)"},
};

const data = [
	{month: "Jan", workers: 120, visitors: 45},
	{month: "Feb", workers: 145, visitors: 52},
	{month: "Mar", workers: 132, visitors: 61},
];

export function WorkersChart() {
	const option = {
		tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
		grid: {left: "3%", right: "4%", bottom: "3%", containLabel: true},
		xAxis: {type: "category", data: data.map((d) => d.month)},
		yAxis: {
			type: "value",
			splitLine: {lineStyle: {color: "var(--border)", type: "dashed"}},
		},
		series: [
			{name: "Workers", type: "bar", data: data.map((d) => d.workers)},
			{name: "Visitors", type: "bar", data: data.map((d) => d.visitors)},
		],
	};

	return <ChartContainer option={option} seriesThemes={[{tone: "primary"}, {colorIndex: 2}]} style={{height: 300}} />;
}
```

Pass series tones as the `seriesThemes` prop rather than calling `createThemedChartOption` yourself.
Both resolve the same tokens, but the prop resolves them **inside** the container, on every theme
change — a pre-resolved option holds concrete RGB strings from whichever theme was live when it was
built, so a memoised one keeps its light-mode colors after a switch to dark. `ChartContainer` also
fills in label, axis-line and gridline colors from the live theme, which ECharts otherwise defaults
to the literals `#333` and `#ccc`.

`ChartContainer` normalizes nested ECharts color fields containing `var(...)`, `oklch(...)`, or other
CSS Color 4 functions before they reach canvas. Prefer `createThemedChartOption` or
`TrendChart.seriesThemes` so series colors stay token-derived:

```tsx
const seriesThemes = [
	{tone: "success"}, // success/healthy line
	{tone: "destructive"}, // error/failure line
	{colorIndex: 2}, // latency series
	{tone: "primary"}, // percentage series
];

<TrendChart title="Service health" option={lineAndBarOption} seriesThemes={seriesThemes} />;
```

### ChartRenderer (AI-generated ChartData payloads)

```tsx
import {ChartRenderer} from "@wakecap/core-ui/chat/core-chart-renderer";
import type {ChartData} from "@wakecap/core-ui/types/chat";

const chartData: ChartData = {
	chartType: "line",
	data: [
		{week: "W1", headcount: 120},
		{week: "W2", headcount: 145},
		{week: "W3", headcount: 132},
	],
	config: {headcount: {label: "Headcount"}},
	xAxisKey: "week",
	dataKeys: ["headcount"],
	title: "Weekly Headcount",
};

<ChartRenderer chartData={chartData} height={300} />;
```

## Core Patterns

### useChartTheme hook for theme-aware colours

```tsx
import {useChartTheme} from "@wakecap/core-ui/chart";

function MyChart() {
	const {colors, textColor, mutedColor, borderColor, backgroundColor} = useChartTheme();

	// colors = array of 5 chart colors from CSS variables (--chart-1 through --chart-5)
	// textColor = foreground color as RGB string
	// borderColor = border color as RGB string
}
```

The hook recomputes on every theme change (a class or `data-theme` flip on `<html>`, or a system
preference change), so an option built from its values is never stale. If you resolve tokens some
other way and memoise the result, key that memo on `useThemeVersion()` from the same module:

```tsx
import {useThemeVersion} from "@wakecap/core-ui/chart";

const themeVersion = useThemeVersion();
const option = React.useMemo(() => buildOption(), [data, themeVersion]);
```

### ECharts option pattern

All charts follow the same pattern — build an ECharts `option` object and pass it to `ChartContainer`:

```tsx
<ChartContainer option={option} style={{height: 300}} />
```

The `option` object follows the [Apache ECharts option spec](https://echarts.apache.org/en/option.html).

### ChartType values for ChartRenderer

```tsx
// ChartType: "bar" | "line" | "area" | "pie" | "scatter"

// Pie requires data with exactly "name" and "value" keys
const pieData: ChartData = {
	chartType: "pie",
	data: [
		{name: "Civil", value: 1245},
		{name: "Electrical", value: 856},
		{name: "Mechanical", value: 723},
	],
	config: {},
};

// Scatter requires numeric xAxisKey and dataKeys[0] as y-axis
const scatterData: ChartData = {
	chartType: "scatter",
	data: [
		{x: 10, y: 20},
		{x: 30, y: 15},
	],
	config: {},
	xAxisKey: "x",
	dataKeys: ["y"],
};
```

## Common Mistakes

### MEDIUM Expecting server-side color helpers to return resolved RGB

Wrong:

```tsx
// During SSR there is no computed theme, so these return var(--chart-*) references.
const colors = getChartColors();
```

Correct:

```tsx
import {getChartColors} from "@wakecap/core-utils";

useEffect(() => {
	const colors = getChartColors();
	setChartColors(colors);
}, []);

// Or use the hook (recommended):
const {colors} = useChartTheme();
```

The helpers are SSR-safe, but actual RGB resolution requires the browser's computed theme, and each
call answers for the theme that is live at that moment. Prefer `ChartContainer.seriesThemes` /
`TrendChart.seriesThemes`, which re-resolve on a theme change; call the lower-level helpers after
mount, and re-run them on `useThemeVersion()`.

Source: `packages/utils/src/index.ts:12`

---

### MEDIUM ChartRenderer pie data missing "name" and "value" keys

Wrong:

```tsx
const chartData: ChartData = {
	chartType: "pie",
	data: [{category: "Civil", count: 1245}],
	config: {},
};
```

Correct:

```tsx
const chartData: ChartData = {
	chartType: "pie",
	data: [{name: "Civil", value: 1245}],
	config: {},
};
```

`ChartRenderer`'s pie case hard-codes `dataKey="value"` and `nameKey="name"`.
Data with any other key names renders a pie with no segments without throwing an error.

Source: `packages/components/src/chat/core-chart-renderer.tsx`

---

See also: `core-tokens/SKILL.md` — --chart-1..5 colour values and dark mode
See also: `core-utils/SKILL.md` — getCssVarAsRgb, getChartColors browser constraint
See also: `core-ui-chat/SKILL.md` — ChartRenderer usage in AI chat messages
