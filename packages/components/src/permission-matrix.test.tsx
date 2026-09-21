import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page, userEvent} from "vitest/browser";

import {PermissionMatrix, type PermissionMatrixCategory} from "./permission-matrix";

const categories: PermissionMatrixCategory[] = [
	{
		id: "complaints",
		label: "Complaints",
		groups: [
			{
				id: "complaints.translation",
				label: "Translation",
				permissions: [
					{id: "complaints.import", label: "Import"},
					{id: "complaints.view", label: "View"},
				],
			},
		],
	},
	{
		id: "network",
		label: "Network Administration",
		groups: [
			{
				id: "network.main",
				label: "Network",
				permissions: [{id: "network.manage", label: "Manage"}],
			},
		],
	},
];

test("cascades a parent selection in one controlled value update", async () => {
	const onValueChange = vi.fn();
	await render(
		<PermissionMatrix categories={categories} value={{"complaints.view": true}} onValueChange={onValueChange} />,
	);

	await userEvent.click(page.getByRole("checkbox", {name: "Toggle all Complaints permissions"}));

	expect(onValueChange).toHaveBeenCalledTimes(1);
	expect(onValueChange).toHaveBeenCalledWith({
		"complaints.import": true,
		"complaints.view": true,
	});
});

test("switches the detail columns without changing permission state", async () => {
	const onValueChange = vi.fn();
	await render(<PermissionMatrix categories={categories} value={{}} onValueChange={onValueChange} />);

	await userEvent.click(page.getByRole("button", {name: "Network Administration"}));

	await expect.element(page.getByRole("checkbox", {name: "Manage"})).toBeVisible();
	expect(onValueChange).not.toHaveBeenCalled();
});

test("reports selected leaves against the complete catalog", async () => {
	await render(<PermissionMatrix categories={categories} value={{"complaints.view": true, "network.manage": true}} />);

	await expect.element(page.getByText("2/3", {exact: true})).toBeVisible();
});
