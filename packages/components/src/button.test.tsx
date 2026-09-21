import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {Button} from "./button";

test("Button renders with text", async () => {
	await render(<Button>Click me</Button>);
	const button = page.getByRole("button", {name: "Click me"});
	await expect.element(button).toBeVisible();
});

test("Button shows loading spinner when loading prop is true", async () => {
	await render(<Button loading>Click me</Button>);
	const button = page.getByRole("button");
	await expect.element(button).toBeVisible();
	await expect.element(button).toHaveAttribute("disabled", "");
	const spinner = button.locator("svg");
	await expect.element(spinner).toBeVisible();
	await expect.element(button).toHaveTextContent("Click me");
});

test("Button is disabled when loading", async () => {
	await render(<Button loading>Submit</Button>);
	const button = page.getByRole("button");
	await expect.element(button).toHaveAttribute("disabled", "");
});

test("Button with icon size shows only spinner when loading", async () => {
	await render(
		<Button icon loading>
			<span>Icon</span>
		</Button>,
	);
	const button = page.getByRole("button");
	await expect.element(button).toBeVisible();
	const spinner = button.locator("svg");
	await expect.element(spinner).toBeVisible();
	await expect.element(button).not.toHaveTextContent("Icon");
});

test("Button without children shows only spinner when loading", async () => {
	await render(<Button loading />);
	const button = page.getByRole("button");
	await expect.element(button).toBeVisible();
	const spinner = button.locator("svg");
	await expect.element(spinner).toBeVisible();
});

test("Button respects disabled prop even when not loading", async () => {
	await render(<Button disabled>Disabled Button</Button>);
	const button = page.getByRole("button");
	await expect.element(button).toHaveAttribute("disabled", "");
});

test("Button is disabled when either loading or disabled is true", async () => {
	const {rerender} = await render(
		<Button loading={false} disabled={false}>
			Button
		</Button>,
	);
	let button = page.getByRole("button");
	await expect.element(button).not.toHaveAttribute("disabled");

	await rerender(
		<Button loading={true} disabled={false}>
			Button
		</Button>,
	);
	button = page.getByRole("button");
	await expect.element(button).toHaveAttribute("disabled", "");

	await rerender(
		<Button loading={false} disabled={true}>
			Button
		</Button>,
	);
	button = page.getByRole("button");
	await expect.element(button).toHaveAttribute("disabled", "");

	await rerender(
		<Button loading={true} disabled={true}>
			Button
		</Button>,
	);
	button = page.getByRole("button");
	await expect.element(button).toHaveAttribute("disabled", "");
});

test("Button renders children normally when not loading", async () => {
	await render(<Button>Normal Button</Button>);
	const button = page.getByRole("button", {name: "Normal Button"});
	await expect.element(button).toBeVisible();
	await expect.element(button).not.toHaveAttribute("disabled");
	const spinner = button.locator("svg");
	await expect.element(spinner).not.toBeInTheDocument();
});
