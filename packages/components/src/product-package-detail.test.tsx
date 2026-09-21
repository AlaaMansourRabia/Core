import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {
	ProductPackageDetail,
	type ProductPackageDetailProps,
	type ProductPackageInstallReceipt,
} from "./product-package-detail";

const BASE: ProductPackageDetailProps = {
	package: {
		id: "attendance",
		name: "Attendance",
		apiName: "core.attendance",
		version: "2.1.0",
		description: "Shift attendance from badge reads.",
		kind: "Data product",
		publisher: "Core Platform",
	},
	dependencies: [
		{id: "d1", name: "Workforce core", version: "1.4.0", status: "satisfied"},
		{id: "d2", name: "Badge reads", version: "0.9.0", status: "missing"},
	],
	outputs: [{id: "o1", name: "Attendance", kind: "Object type", action: "add"}],
	permissions: [
		{id: "p1", label: "Install · Prod", granted: false, roles: ["Platform admin"]},
		{id: "p2", label: "View OSDK scopes", granted: true},
	],
	evidence: [{id: "e1", label: "Read model", count: 4, status: "verified"}],
	target: {projectName: "Riyadh Metro", environment: "Prod"},
	actor: {name: "A. Ibrahim", role: "Platform admin"},
};

test("ProductPackageDetail keeps the package readable for a view-only persona", async () => {
	await render(
		<ProductPackageDetail {...BASE} canInstall={false} denialReason="Install · Prod requires Platform admin." />,
	);

	// Every section still reads — a refusal is not a reason to hide what the package is.
	await expect.element(page.getByText("Attendance").first()).toBeInTheDocument();
	await expect.element(page.getByText("Workforce core")).toBeInTheDocument();
	await expect.element(page.getByText("Object type")).toBeInTheDocument();
	await expect.element(page.getByText("Read model")).toBeInTheDocument();
	await expect.element(page.getByText("Install · Prod requires Platform admin.")).toBeInTheDocument();
});

test("ProductPackageDetail disables only the install action when unauthorized", async () => {
	const {container} = await render(
		<ProductPackageDetail {...BASE} canInstall={false} denialReason="Install · Prod requires Platform admin." />,
	);

	const action = container.querySelector<HTMLButtonElement>("[data-testid='product-package-install-action']");
	expect(action?.disabled).toBe(true);
	// Nothing else on the surface is disabled by the refusal.
	const otherDisabled = [...container.querySelectorAll<HTMLButtonElement>("button:disabled")].filter(
		(button) => button.dataset.testid !== "product-package-install-action",
	);
	expect(otherDisabled).toEqual([]);
});

test("ProductPackageDetail runs the governed install and reports a receipt", async () => {
	const onInstall = vi.fn();
	const receipts: ProductPackageInstallReceipt[] = [];
	await render(<ProductPackageDetail {...BASE} onInstall={onInstall} onInstalled={(r) => receipts.push(r)} />);

	await page.getByTestId("product-package-install-action").click();

	// The plan is observable before anything is written.
	await expect.element(page.getByRole("dialog")).toBeInTheDocument();
	await expect.element(page.getByText("Riyadh Metro · Prod, as A. Ibrahim (Platform admin).")).toBeInTheDocument();
	await expect.element(page.getByText("Unmet dependencies")).toBeInTheDocument();

	await page.getByTestId("product-package-confirm-action").click();

	expect(onInstall).toHaveBeenCalledWith({
		packageId: "attendance",
		packageName: "Attendance",
		version: "2.1.0",
		project: {projectName: "Riyadh Metro", environment: "Prod"},
		actor: {name: "A. Ibrahim", role: "Platform admin"},
	});
	expect(receipts).toHaveLength(1);
	expect(receipts[0]?.installedAt).toBeTruthy();
	await expect.element(page.getByText("Installed").first()).toBeInTheDocument();
});

test("ProductPackageDetail refuses to confirm while a blocker stands", async () => {
	const onInstall = vi.fn();
	await render(
		<ProductPackageDetail
			{...BASE}
			blockers={[{code: "readiness", message: "Release evidence is incomplete."}]}
			onInstall={onInstall}
		/>,
	);

	await expect.element(page.getByText("Release evidence is incomplete.").first()).toBeInTheDocument();
	await page.getByTestId("product-package-install-action").click();

	const confirmAction = document.querySelector<HTMLButtonElement>("[data-testid='product-package-confirm-action']");
	expect(confirmAction?.disabled).toBe(true);
	expect(onInstall).not.toHaveBeenCalled();
});

test("ProductPackageDetail states a failed install instead of claiming success", async () => {
	const onInstalled = vi.fn();
	await render(
		<ProductPackageDetail
			{...BASE}
			blockers={[]}
			onInstall={() => Promise.reject(new Error("Apply rejected by the platform."))}
			onInstalled={onInstalled}
		/>,
	);

	await page.getByTestId("product-package-install-action").click();
	await page.getByTestId("product-package-confirm-action").click();

	await expect.element(page.getByText("Apply rejected by the platform.")).toBeInTheDocument();
	expect(onInstalled).not.toHaveBeenCalled();
});

test("ProductPackageDetail names the upgrade when an older version is installed", async () => {
	await render(<ProductPackageDetail {...BASE} installState={{status: "outdated", version: "1.9.0"}} />);

	await expect.element(page.getByTestId("product-package-install-action")).toHaveTextContent("Upgrade to 2.1.0");
	await expect.element(page.getByText("Update available")).toBeInTheDocument();
});

test("ProductPackageDetail parks the action once the installed version is current", async () => {
	const {container} = await render(
		<ProductPackageDetail {...BASE} installState={{status: "installed", version: "2.1.0"}} />,
	);

	const action = container.querySelector<HTMLButtonElement>("[data-testid='product-package-install-action']");
	expect(action?.disabled).toBe(true);
	expect(action?.textContent).toContain("Installed");
});
