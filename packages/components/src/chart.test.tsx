import * as echarts from "echarts";
import {afterEach, expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {ChartContainer, useChartTheme} from "./chart";

/**
 * The tests own the tokens, because nothing loads the library's stylesheet into the browser fixture.
 * Two values for `--foreground` and `--primary` — one per theme — is all the fixture needs to prove
 * that a switch is noticed.
 */
function installThemeTokens() {
	const style = document.createElement("style");
	style.dataset.testTokens = "true";
	style.textContent = `
		:root {--foreground: rgb(10, 20, 30); --primary: rgb(11, 22, 33);}
		.dark {--foreground: rgb(200, 210, 220); --primary: rgb(211, 222, 233);}
	`;
	document.head.appendChild(style);
	return style;
}

afterEach(() => {
	document.documentElement.classList.remove("dark");
	document.querySelectorAll("style[data-test-tokens]").forEach((node) => node.remove());
});

function ThemeProbe() {
	const {textColor} = useChartTheme();
	return <p data-testid="text-color">{textColor}</p>;
}

test("useChartTheme re-reads its colors when the theme changes", async () => {
	installThemeTokens();
	await render(<ThemeProbe />);

	await expect.element(page.getByTestId("text-color")).toHaveTextContent("rgb(10, 20, 30)");

	document.documentElement.classList.add("dark");

	await expect.element(page.getByTestId("text-color")).toHaveTextContent("rgb(200, 210, 220)");
});

test("ChartContainer repaints its series in the new theme, even though the option never changes", async () => {
	installThemeTokens();

	// The memoised option a sensible caller passes: stable identity across the theme switch, so
	// nothing but the theme itself can trigger the repaint.
	const option = {
		xAxis: {type: "category", data: ["a", "b"]},
		yAxis: {type: "value"},
		series: [{type: "bar", data: [1, 2]}],
	} as const;

	const screen = await render(
		<div style={{width: 400}}>
			<ChartContainer option={option} seriesThemes={[{tone: "primary"}]} height={200} />
		</div>,
	);

	const seriesColor = () => {
		const host = [...screen.container.querySelectorAll("div")].find((node) => echarts.getInstanceByDom(node));
		const instance = host ? echarts.getInstanceByDom(host) : undefined;
		const series = instance?.getOption().series as {itemStyle?: {color?: string}}[] | undefined;
		return series?.[0]?.itemStyle?.color;
	};

	await expect.poll(seriesColor).toBe("rgb(11, 22, 33)");

	document.documentElement.classList.add("dark");

	await expect.poll(seriesColor).toBe("rgb(211, 222, 233)");
});
