import {useState} from "react";
import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {FormDialog, FormDialogField} from "./form-dialog";
import {Input} from "./input";

/** A minimal host exercising the real contract: one required field, a live `valid`. */
function Host({onSubmit, open = true}: {onSubmit?: (value: string) => void; open?: boolean}) {
	const [name, setName] = useState("");
	const [isOpen, setIsOpen] = useState(open);
	const valid = name.trim().length > 0;

	return (
		<FormDialog
			open={isOpen}
			onOpenChange={setIsOpen}
			title="Create process"
			valid={valid}
			hint="Name it, then create."
			error="Name required."
			submitLabel="Create process"
			onSubmit={() => onSubmit?.(name.trim())}
			onReset={() => setName("")}
		>
			<FormDialogField label="Name" invalid={!valid}>
				{({invalid, id}) => (
					<Input id={id} aria-invalid={invalid} value={name} onChange={(e) => setName(e.target.value)} />
				)}
			</FormDialogField>
		</FormDialog>
	);
}

test("FormDialog shows the hint and no error before a submit is attempted", async () => {
	await render(<Host />);
	await expect.element(page.getByText("Name it, then create.")).toBeVisible();
	expect(document.body.textContent).not.toContain("Name required.");
});

test("FormDialog never disables submit; a refused press reveals the error instead", async () => {
	const onSubmit = vi.fn();
	await render(<Host onSubmit={onSubmit} />);

	const submit = page.getByRole("button", {name: "Create process"});
	await expect.element(submit).toBeEnabled();

	await submit.click();
	expect(onSubmit).not.toHaveBeenCalled();
	await expect.element(page.getByText("Name required.")).toBeVisible();
});

test("FormDialog paints a field invalid only after a refused submit", async () => {
	await render(<Host />);
	const field = page.getByRole("textbox", {name: "Name"});

	// Empty and therefore invalid — but untouched, so nothing is painted yet.
	await expect.element(field).toHaveAttribute("aria-invalid", "false");

	await page.getByRole("button", {name: "Create process"}).click();
	await expect.element(field).toHaveAttribute("aria-invalid", "true");
});

test("FormDialog submits once valid and hands back the value", async () => {
	const onSubmit = vi.fn();
	await render(<Host onSubmit={onSubmit} />);

	await page.getByRole("textbox", {name: "Name"}).fill("Lifting plan approval");
	await page.getByRole("button", {name: "Create process"}).click();

	expect(onSubmit).toHaveBeenCalledWith("Lifting plan approval");
});

test("FormDialog resets when dismissed, so the next open is empty", async () => {
	await render(<Host />);

	await page.getByRole("textbox", {name: "Name"}).fill("half-typed");
	await page.getByRole("button", {name: "Cancel"}).click();

	// The host owns the value; onReset is what clears it on the way out.
	await expect.element(page.getByRole("textbox", {name: "Name"})).not.toBeInTheDocument();
});

test("FormDialogField renders plain children when there is nothing to validate", async () => {
	await render(
		<FormDialog
			open
			onOpenChange={() => {}}
			title="New pipeline"
			valid
			submitLabel="Create pipeline"
			onSubmit={() => {}}
		>
			<FormDialogField label="Description" hint="Optional.">
				<Input aria-label="Description" />
			</FormDialogField>
		</FormDialog>,
	);

	await expect.element(page.getByText("Description")).toBeVisible();
	await expect.element(page.getByText("Optional.")).toBeVisible();
	await expect.element(page.getByRole("textbox", {name: "Description"})).toBeVisible();
});

test("FormDialogField binds its caption to the control it labels", async () => {
	await render(<Host />);

	// Named by its visible caption, not by the aria-label the host also happens to set — the label
	// is what a screen reader would read, and before this it read nothing at all.
	const field = page.getByRole("textbox", {name: "Name"});
	const control = field.element() as HTMLInputElement;
	const label = document.querySelector(`label[for="${control.id}"]`);

	expect(control.id).not.toBe("");
	expect(label?.textContent).toBe("Name");
});

test("FormDialogField links its hint to the control, so an invalid field says why", async () => {
	await render(
		<FormDialog open onOpenChange={() => {}} title="New process" valid submitLabel="Create" onSubmit={() => {}}>
			<FormDialogField label="Backing object type" hint="Its rows are the tokens of this process.">
				{({id, describedBy}) => <Input id={id} aria-describedby={describedBy} />}
			</FormDialogField>
		</FormDialog>,
	);

	const control = document.querySelector("input") as HTMLInputElement;
	const describedBy = control.getAttribute("aria-describedby") ?? "";

	expect(describedBy).not.toBe("");
	expect(document.getElementById(describedBy)?.textContent).toBe("Its rows are the tokens of this process.");
});

test("FormDialogField names a control it cannot reach, given the id", async () => {
	await render(
		<FormDialog open onOpenChange={() => {}} title="New process" valid submitLabel="Create" onSubmit={() => {}}>
			<FormDialogField label="Description" htmlFor="own-description">
				<textarea id="own-description" />
			</FormDialogField>
		</FormDialog>,
	);

	expect(document.querySelector('label[for="own-description"]')?.textContent).toBe("Description");
});
