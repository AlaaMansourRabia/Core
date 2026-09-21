import {useState} from "react";
import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {Input} from "./input";
import {WizardDialog} from "./wizard-dialog";

/** Three steps, the first of which is gated on a required field. */
function Host({onSubmit}: {onSubmit?: () => void}) {
	const [open, setOpen] = useState(true);
	const [name, setName] = useState("");

	return (
		<WizardDialog
			open={open}
			onOpenChange={setOpen}
			title="New object type"
			steps={[
				{
					label: "Metadata",
					valid: name.trim().length > 0,
					content: ({attempted}) => (
						<Input
							aria-label="Display name"
							aria-invalid={attempted && name.trim().length === 0}
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					),
				},
				{label: "Properties", content: <p>Properties step</p>},
				{label: "Review", content: <p>Review step</p>},
			]}
			submitLabel="Create object type"
			onSubmit={() => onSubmit?.()}
			onReset={() => setName("")}
		/>
	);
}

test("WizardDialog opens on the first step and counts them", async () => {
	await render(<Host />);
	await expect.element(page.getByText("Step 1 of 3")).toBeVisible();
	await expect.element(page.getByRole("textbox", {name: "Display name"})).toBeVisible();
	// Back is absent on the first step rather than disabled.
	await expect.element(page.getByRole("button", {name: "← Back"})).not.toBeInTheDocument();
});

test("WizardDialog holds position when Next is pressed on an unsatisfied step", async () => {
	await render(<Host />);

	const next = page.getByRole("button", {name: "Next →"});
	await expect.element(next).toBeEnabled();
	await next.click();

	await expect.element(page.getByText("Step 1 of 3")).toBeVisible();
	await expect.element(page.getByRole("textbox", {name: "Display name"})).toHaveAttribute("aria-invalid", "true");
});

test("WizardDialog advances once the step is satisfied", async () => {
	await render(<Host />);

	await page.getByRole("textbox", {name: "Display name"}).fill("Permit");
	await page.getByRole("button", {name: "Next →"}).click();

	await expect.element(page.getByText("Step 2 of 3")).toBeVisible();
	await expect.element(page.getByText("Properties step")).toBeVisible();
});

test("WizardDialog mounts only the current step", async () => {
	await render(<Host />);
	expect(document.body.textContent).not.toContain("Review step");

	await page.getByRole("textbox", {name: "Display name"}).fill("Permit");
	await page.getByRole("button", {name: "Next →"}).click();
	await page.getByRole("button", {name: "Next →"}).click();

	await expect.element(page.getByText("Review step")).toBeVisible();
	expect(document.body.textContent).not.toContain("Properties step");
});

test("WizardDialog swaps Next for the submit label on the last step", async () => {
	const onSubmit = vi.fn();
	await render(<Host onSubmit={onSubmit} />);

	await page.getByRole("textbox", {name: "Display name"}).fill("Permit");
	await page.getByRole("button", {name: "Next →"}).click();
	await page.getByRole("button", {name: "Next →"}).click();

	await expect.element(page.getByText("Step 3 of 3")).toBeVisible();
	await expect.element(page.getByRole("button", {name: "Next →"})).not.toBeInTheDocument();

	await page.getByRole("button", {name: "Create object type"}).click();
	expect(onSubmit).toHaveBeenCalledOnce();
});

test("WizardDialog clears the attempted flag when the step changes", async () => {
	await render(<Host />);

	// Refuse once so the flag is set, then satisfy the step and move on and back.
	await page.getByRole("button", {name: "Next →"}).click();
	await expect.element(page.getByRole("textbox", {name: "Display name"})).toHaveAttribute("aria-invalid", "true");

	await page.getByRole("textbox", {name: "Display name"}).fill("Permit");
	await page.getByRole("button", {name: "Next →"}).click();
	await page.getByRole("button", {name: "← Back"}).click();

	await expect.element(page.getByRole("textbox", {name: "Display name"})).toHaveAttribute("aria-invalid", "false");
});

test("WizardDialog takes a per-step Next label", async () => {
	await render(
		<WizardDialog
			open
			onOpenChange={() => {}}
			title="Install product"
			steps={[
				{label: "Draft", nextLabel: "Plan", content: <p>Draft step</p>},
				{label: "Apply", content: <p>Apply step</p>},
			]}
			submitLabel="Apply install"
			onSubmit={() => {}}
		/>,
	);

	await expect.element(page.getByRole("button", {name: "Plan"})).toBeVisible();
	await expect.element(page.getByRole("button", {name: "Next →"})).not.toBeInTheDocument();
});
