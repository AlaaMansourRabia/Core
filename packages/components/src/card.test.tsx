import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {Card, CardContent, CardHeader, CardTitle} from "./card";

test("Card renders its children", async () => {
	await render(<Card>card body</Card>);
	await expect.element(page.getByText("card body")).toBeVisible();
});

test("Card composes its sub-components", async () => {
	await render(
		<Card>
			<CardHeader>
				<CardTitle>Title</CardTitle>
			</CardHeader>
			<CardContent>Body</CardContent>
		</Card>,
	);
	await expect.element(page.getByText("Title")).toBeVisible();
	await expect.element(page.getByText("Body")).toBeVisible();
});

for (const variant of ["stat", "floor", "floating", "object", "tv"] as const) {
	test(`Card renders the ${variant} variant`, async () => {
		await render(<Card variant={variant}>{`${variant} surface`}</Card>);
		await expect.element(page.getByText(`${variant} surface`)).toBeVisible();
	});
}
