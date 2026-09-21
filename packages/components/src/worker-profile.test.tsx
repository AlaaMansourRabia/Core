import * as React from "react";
import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page, userEvent} from "vitest/browser";

import {Badge} from "./badge";
import {WorkerProfile} from "./worker-profile";

const certificate = {
	id: "c-1",
	title: "Working at Height",
	expiryDate: "18 Jun, 2027",
	status: "Valid",
} as const;

test("renders the General tab fields by default", async () => {
	await render(<WorkerProfile general={[{fields: [{label: "Name", value: "John Doe"}]}]} />);
	await expect.element(page.getByText("John Doe")).toBeVisible();
});

test("falls back to the empty text for tabs without data", async () => {
	await render(<WorkerProfile defaultTab="certificates" />);
	await expect.element(page.getByText("No certificates found.")).toBeVisible();
});

test("renders caller actions in the Certificates tab header", async () => {
	await render(
		<WorkerProfile
			defaultTab="certificates"
			certificates={[certificate]}
			certificatesActions={<button type="button">Add certificate</button>}
		/>,
	);
	await expect.element(page.getByRole("button", {name: "Add certificate"})).toBeVisible();
});

test("renders caller actions in the Device tab header", async () => {
	await render(
		<WorkerProfile
			defaultTab="device"
			device={[{label: "Device ID", value: "H9435"}]}
			deviceActions={<button type="button">Assign device</button>}
		/>,
	);
	await expect.element(page.getByRole("button", {name: "Assign device"})).toBeVisible();
});

test("shows a certificate's type, issue date, and document link when supplied", async () => {
	await render(
		<WorkerProfile
			defaultTab="certificates"
			certificates={[
				{
					...certificate,
					type: "Height Safety",
					issueDate: "18 Jun, 2025",
					document: {name: "hse-1188.pdf", url: "https://example.com/hse-1188.pdf"},
				},
			]}
		/>,
	);
	await expect.element(page.getByText("Certificate Type:")).toBeVisible();
	await expect.element(page.getByText("Height Safety")).toBeVisible();
	await expect.element(page.getByText("Issue Date:")).toBeVisible();
	await expect
		.element(page.getByRole("link", {name: "hse-1188.pdf"}))
		.toHaveAttribute("href", "https://example.com/hse-1188.pdf");
});

test("renders a document name without a link when no url is on record", async () => {
	await render(
		<WorkerProfile defaultTab="certificates" certificates={[{...certificate, document: {name: "hse-1188.pdf"}}]} />,
	);
	await expect.element(page.getByText("hse-1188.pdf")).toBeVisible();
	expect(page.getByRole("link", {name: "hse-1188.pdf"}).elements()).toHaveLength(0);
});

test("omits the optional certificate rows when they are not supplied", async () => {
	await render(<WorkerProfile defaultTab="certificates" certificates={[certificate]} />);
	await expect.element(page.getByText("Certificate Title:")).toBeVisible();
	expect(page.getByText("Certificate Type:").elements()).toHaveLength(0);
	expect(page.getByText("Issue Date:").elements()).toHaveLength(0);
	expect(page.getByText("Document:").elements()).toHaveLength(0);
});

test("renders the typed compliance model", async () => {
	await render(
		<WorkerProfile
			defaultTab="compliance"
			compliance={{score: {value: 3, total: 4}, items: [{id: "bg", title: "Background Check", status: "Not set"}]}}
		/>,
	);
	await expect.element(page.getByText("Compliance Score:")).toBeVisible();
	await expect.element(page.getByText("Background Check")).toBeVisible();
});

test("renders caller-supplied content when compliance is a node", async () => {
	await render(<WorkerProfile defaultTab="compliance" compliance={<p>Host-owned compliance</p>} />);
	await expect.element(page.getByText("Host-owned compliance")).toBeVisible();
	expect(page.getByText("Compliance Score:").elements()).toHaveLength(0);
});

test("renders an array of compliance nodes", async () => {
	await render(
		<WorkerProfile defaultTab="compliance" compliance={[<p key="a">First check</p>, <p key="b">Second check</p>]} />,
	);
	await expect.element(page.getByText("First check")).toBeVisible();
	await expect.element(page.getByText("Second check")).toBeVisible();
});

test("falls back to the compliance empty text when the model has no items", async () => {
	await render(<WorkerProfile defaultTab="compliance" compliance={{items: []}} />);
	await expect.element(page.getByText("No compliance record.")).toBeVisible();
});

test("renders no identity region unless one is supplied", async () => {
	await render(<WorkerProfile general={[{fields: [{label: "Name", value: "John Doe"}]}]} />);
	expect(page.getByRole("button", {name: "Worker actions"}).elements()).toHaveLength(0);
});

test("renders the identity name, subtitle, and actions slot", async () => {
	await render(
		<WorkerProfile
			identity={{
				name: "John Doe",
				subtitle: "123423 · Aramco · Electrician",
				actions: (
					<button type="button" aria-label="Worker actions">
						⋯
					</button>
				),
			}}
		/>,
	);
	await expect.element(page.getByText("John Doe")).toBeVisible();
	await expect.element(page.getByText("123423 · Aramco · Electrician")).toBeVisible();
	await expect.element(page.getByRole("button", {name: "Worker actions"})).toBeVisible();
});

test("falls back to the worker's initials when there is no photo", async () => {
	await render(<WorkerProfile identity={{name: "John Doe"}} />);
	await expect.element(page.getByText("JD")).toBeVisible();
});

test("reports tab changes through onTabChange", async () => {
	const seen: string[] = [];
	await render(
		<WorkerProfile
			general={[{fields: [{label: "Name", value: "John Doe"}]}]}
			crew={<p>Crew A</p>}
			onTabChange={(next) => seen.push(next)}
		/>,
	);

	await userEvent.click(page.getByRole("tab", {name: "Crew"}));
	await expect.element(page.getByText("Crew A")).toBeVisible();
	expect(seen).toEqual(["crew"]);
});

test("stays on the controlled tab until the caller moves it", async () => {
	await render(<WorkerProfile tab="device" device={[{label: "Device ID", value: "H9435"}]} crew={<p>Crew A</p>} />);
	await expect.element(page.getByText("H9435")).toBeVisible();

	await userEvent.click(page.getByRole("tab", {name: "Crew"}));
	// The caller owns the value, so the widget does not move itself.
	await expect.element(page.getByText("H9435")).toBeVisible();
	expect(page.getByText("Crew A").elements()).toHaveLength(0);
});

// ─── Per-tab loading / error state ───────────────────────────────────────────

test("shows a loading treatment instead of the empty text", async () => {
	const {container} = await render(
		<WorkerProfile defaultTab="certificates" tabStates={{certificates: {status: "loading"}}} />,
	);

	expect(container.querySelector("[data-testid='worker-profile-tab-loading']")).not.toBeNull();
	expect(container.textContent).not.toContain("No certificates found.");
});

test("states a failed tab fetch and offers the host's retry", async () => {
	const onRetry = vi.fn();
	await render(<WorkerProfile defaultTab="certificates" tabStates={{certificates: {status: "error", onRetry}}} />);

	await expect.element(page.getByText("Couldn't load certificates.")).toBeVisible();
	await userEvent.click(page.getByRole("button", {name: "Retry"}));
	expect(onRetry).toHaveBeenCalledTimes(1);
});

test("takes an error message from the host and omits Retry without a handler", async () => {
	const {container} = await render(
		<WorkerProfile
			defaultTab="device"
			tabStates={{device: {status: "error", message: "Device service unreachable."}}}
		/>,
	);

	await expect.element(page.getByText("Device service unreachable.")).toBeVisible();
	expect(container.querySelector("button[type='button']:not([role='tab'])")).toBeNull();
});

test("lets a tab state win over data the caller already has", async () => {
	const {container} = await render(
		<WorkerProfile
			defaultTab="certificates"
			certificates={[certificate]}
			tabStates={{certificates: {status: "loading"}}}
		/>,
	);

	expect(container.textContent).not.toContain("Working at Height");
	expect(container.querySelector("[data-testid='worker-profile-tab-loading']")).not.toBeNull();
});

test("leaves unnamed tabs on their data-or-empty behaviour", async () => {
	const {container} = await render(
		<WorkerProfile defaultTab="certificates" certificates={[certificate]} tabStates={{device: {status: "loading"}}} />,
	);

	expect(container.textContent).toContain("Working at Height");
	expect(container.querySelector("[data-testid='worker-profile-tab-loading']")).toBeNull();
});

test("renders only the tabs the host declares", async () => {
	await render(
		<WorkerProfile tabs={["general", "certificates"]} general={[{fields: [{label: "Name", value: "J"}]}]} />,
	);

	await expect.element(page.getByRole("tab", {name: "General"})).toBeVisible();
	await expect.element(page.getByRole("tab", {name: "Certificates"})).toBeVisible();
	// A tab this product has no concept of is absent, not permanently empty.
	await expect.element(page.getByRole("tab", {name: "Visits"})).not.toBeInTheDocument();
	expect(document.body.textContent).not.toContain("No visit records.");
});

test("renders all seven tabs when the allow-list is omitted", async () => {
	await render(<WorkerProfile />);
	await expect.element(page.getByRole("tab", {name: "Visits"})).toBeVisible();
});

test("falls back to the first visible tab when defaultTab was left out of the list", async () => {
	await render(<WorkerProfile tabs={["certificates", "device"]} defaultTab="visits" />);

	// Canonical order, not the caller's: certificates comes before device either way.
	await expect.element(page.getByText("No certificates found.")).toBeVisible();
});

// ─── Host wording ────────────────────────────────────────────────────────────

test("takes the host's wording for a tab's empty text", async () => {
	await render(<WorkerProfile defaultTab="certificates" text={{tabs: {certificates: {empty: "لا توجد شهادات."}}}} />);

	await expect.element(page.getByText("لا توجد شهادات.")).toBeVisible();
	expect(page.getByText("No certificates found.").elements()).toHaveLength(0);
});

test("takes the host's wording for a tab's error text and the Retry action", async () => {
	await render(
		<WorkerProfile
			defaultTab="certificates"
			tabStates={{certificates: {status: "error", onRetry: () => {}}}}
			text={{tabs: {certificates: {error: "تعذر تحميل الشهادات."}}, retry: "إعادة المحاولة"}}
		/>,
	);

	await expect.element(page.getByText("تعذر تحميل الشهادات.")).toBeVisible();
	await expect.element(page.getByRole("button", {name: "إعادة المحاولة"})).toBeVisible();
});

test("lets a tab state's own message win over the host's error wording", async () => {
	await render(
		<WorkerProfile
			defaultTab="device"
			tabStates={{device: {status: "error", message: "Device service unreachable."}}}
			text={{tabs: {device: {error: "Host wording."}}}}
		/>,
	);

	await expect.element(page.getByText("Device service unreachable.")).toBeVisible();
	expect(page.getByText("Host wording.").elements()).toHaveLength(0);
});

test("renames a tab everywhere it is named — trigger and header", async () => {
	await render(<WorkerProfile defaultTab="crew" crew={<p>Crew A</p>} text={{tabs: {crew: {label: "Team"}}}} />);

	await expect.element(page.getByRole("tab", {name: "Team"})).toBeVisible();
	await expect.element(page.getByRole("heading", {name: "Team"})).toBeVisible();
	expect(page.getByRole("tab", {name: "Crew"}).elements()).toHaveLength(0);
});

test("keeps the English defaults for text the host leaves out", async () => {
	await render(<WorkerProfile defaultTab="certificates" text={{tabs: {device: {empty: "لا يوجد جهاز."}}}} />);

	await expect.element(page.getByText("No certificates found.")).toBeVisible();
	await expect.element(page.getByRole("tab", {name: "Certificates"})).toBeVisible();
});

// ─── Certificate document handler ────────────────────────────────────────────

test("routes a certificate document click through the host instead of navigating", async () => {
	const onCertificateDocumentClick = vi.fn();
	await render(
		<WorkerProfile
			defaultTab="certificates"
			certificates={[{...certificate, document: {name: "hse-1188.pdf", url: "https://example.com/hse-1188.pdf"}}]}
			onCertificateDocumentClick={onCertificateDocumentClick}
		/>,
	);

	// The handler wins over the url — an authed file cannot be reached by a bare href.
	expect(page.getByRole("link", {name: "hse-1188.pdf"}).elements()).toHaveLength(0);
	await userEvent.click(page.getByRole("button", {name: "hse-1188.pdf"}));
	expect(onCertificateDocumentClick).toHaveBeenCalledTimes(1);
	expect(onCertificateDocumentClick.mock.calls[0]?.[0]).toMatchObject({id: "c-1"});
});

test("offers the document handler for a record with no public url", async () => {
	const onCertificateDocumentClick = vi.fn();
	await render(
		<WorkerProfile
			defaultTab="certificates"
			certificates={[{...certificate, document: {name: "hse-1188.pdf"}}]}
			onCertificateDocumentClick={onCertificateDocumentClick}
		/>,
	);

	await userEvent.click(page.getByRole("button", {name: "hse-1188.pdf"}));
	expect(onCertificateDocumentClick).toHaveBeenCalledTimes(1);
});

test("leaves the document a plain link when no handler is given", async () => {
	await render(
		<WorkerProfile
			defaultTab="certificates"
			certificates={[{...certificate, document: {name: "hse-1188.pdf", url: "https://example.com/hse-1188.pdf"}}]}
		/>,
	);

	await expect
		.element(page.getByRole("link", {name: "hse-1188.pdf"}))
		.toHaveAttribute("href", "https://example.com/hse-1188.pdf");
});

// ─── Per-certificate row actions ─────────────────────────────────────────────

test("renders caller actions on an individual certificate row", async () => {
	const onDelete = vi.fn();
	await render(
		<WorkerProfile
			defaultTab="certificates"
			certificates={[
				{
					...certificate,
					actions: (
						<button type="button" onClick={onDelete}>
							Delete certificate
						</button>
					),
				},
				{id: "c-2", title: "First Aid", expiryDate: "09 Jan, 2027", status: "Valid"},
			]}
		/>,
	);

	// Only the row that carries them — the second certificate has none.
	expect(page.getByRole("button", {name: "Delete certificate"}).elements()).toHaveLength(1);
	await userEvent.click(page.getByRole("button", {name: "Delete certificate"}));
	expect(onDelete).toHaveBeenCalledTimes(1);
	await expect.element(page.getByText("First Aid")).toBeVisible();
});

test("renders rows unchanged when no row actions are supplied", async () => {
	const {container} = await render(<WorkerProfile defaultTab="certificates" certificates={[certificate]} />);

	await expect.element(page.getByText("Working at Height")).toBeVisible();
	expect(container.querySelectorAll("button:not([role='tab'])")).toHaveLength(0);
});

// ─── Compliance decisions ────────────────────────────────────────────────────

const check = {id: "background-check", title: "Background Check", options: ["Pass", "Fail", "Pending"]} as const;

test("reports the option the user picks", async () => {
	const onOptionChange = vi.fn();
	await render(<WorkerProfile defaultTab="compliance" compliance={{items: [{...check, onOptionChange}]}} />);

	await userEvent.click(page.getByRole("radio", {name: "Pass"}));
	expect(onOptionChange).toHaveBeenCalledTimes(1);
	expect(onOptionChange).toHaveBeenCalledWith("Pass");
});

test("holds no choice of its own — the control shows what the host passes", async () => {
	const onOptionChange = vi.fn();
	await render(
		<WorkerProfile
			defaultTab="compliance"
			compliance={{items: [{...check, selectedOption: "Fail", onOptionChange}]}}
		/>,
	);

	await userEvent.click(page.getByRole("radio", {name: "Pass"}));
	expect(onOptionChange).toHaveBeenCalledWith("Pass");
	// The host has not written the new option back, so the segment must not have moved.
	await expect.element(page.getByRole("radio", {name: "Fail"})).toHaveAttribute("aria-checked", "true");
	await expect.element(page.getByRole("radio", {name: "Pass"})).toHaveAttribute("aria-checked", "false");
});

test("moves the choice when the host writes the new option back", async () => {
	function Host() {
		const [verdict, setVerdict] = React.useState("Fail");
		return (
			<WorkerProfile
				defaultTab="compliance"
				compliance={{items: [{...check, selectedOption: verdict, onOptionChange: setVerdict}]}}
			/>
		);
	}
	await render(<Host />);

	await userEvent.click(page.getByRole("radio", {name: "Pass"}));
	await expect.element(page.getByRole("radio", {name: "Pass"})).toHaveAttribute("aria-checked", "true");
	await expect.element(page.getByRole("radio", {name: "Fail"})).toHaveAttribute("aria-checked", "false");
});

test("swallows a re-press of the active choice instead of reporting a cleared answer", async () => {
	const onOptionChange = vi.fn();
	await render(
		<WorkerProfile
			defaultTab="compliance"
			compliance={{items: [{...check, selectedOption: "Pass", onOptionChange}]}}
		/>,
	);

	await userEvent.click(page.getByRole("radio", {name: "Pass"}));
	expect(onOptionChange).not.toHaveBeenCalled();
});

test("keeps the choices uncontrolled for a host that does not take the change", async () => {
	await render(<WorkerProfile defaultTab="compliance" compliance={{items: [{...check, selectedOption: "Fail"}]}} />);

	// No handler: the group still toggles locally, exactly as it did before the callbacks existed.
	await userEvent.click(page.getByRole("radio", {name: "Pass"}));
	await expect.element(page.getByRole("radio", {name: "Pass"})).toHaveAttribute("aria-checked", "true");
});

test("reports the upload intent", async () => {
	const onUploadDocument = vi.fn();
	await render(
		<WorkerProfile
			defaultTab="compliance"
			compliance={{items: [{id: "bg", title: "Background Check", uploadable: true, onUploadDocument}]}}
		/>,
	);

	await userEvent.click(page.getByRole("button", {name: "Upload / replace document"}));
	expect(onUploadDocument).toHaveBeenCalledTimes(1);
});

test("still renders the upload action without a handler", async () => {
	await render(
		<WorkerProfile
			defaultTab="compliance"
			compliance={{items: [{id: "bg", title: "Background Check", uploadable: true}]}}
		/>,
	);

	const upload = page.getByRole("button", {name: "Upload / replace document"});
	await expect.element(upload).toBeVisible();
	await expect.element(upload).toBeEnabled();
});

test("locks a check while its write is in flight", async () => {
	const onOptionChange = vi.fn();
	const onUploadDocument = vi.fn();
	await render(
		<WorkerProfile
			defaultTab="compliance"
			compliance={{items: [{...check, uploadable: true, loading: true, onOptionChange, onUploadDocument}]}}
		/>,
	);

	await expect.element(page.getByRole("button", {name: "Upload / replace document"})).toBeDisabled();
	await expect.element(page.getByRole("radio", {name: "Pass"})).toBeDisabled();
});

test("locks only the check that is writing", async () => {
	await render(
		<WorkerProfile
			defaultTab="compliance"
			compliance={{
				items: [
					{...check, loading: true, onOptionChange: vi.fn()},
					{id: "sst", title: "SST Card", options: ["Pass", "Fail"], onOptionChange: vi.fn()},
				],
			}}
		/>,
	);

	const [first, second] = page.getByRole("radio", {name: "Fail"}).elements();
	expect(first).toBeDisabled();
	expect(second).toBeEnabled();
});

test("fires once per activation, in order, with nothing coalesced", async () => {
	const onOptionChange = vi.fn();
	await render(<WorkerProfile defaultTab="compliance" compliance={{items: [{...check, onOptionChange}]}} />);

	await userEvent.click(page.getByRole("radio", {name: "Pass"}));
	await userEvent.click(page.getByRole("radio", {name: "Fail"}));
	expect(onOptionChange.mock.calls.map((call) => call[0])).toEqual(["Pass", "Fail"]);
});

test("renders the compliance footer under the checks", async () => {
	const onSave = vi.fn();
	await render(
		<WorkerProfile
			defaultTab="compliance"
			compliance={{
				items: [{id: "bg", title: "Background Check"}],
				footer: (
					<button type="button" onClick={onSave}>
						Save compliance
					</button>
				),
			}}
		/>,
	);

	await userEvent.click(page.getByRole("button", {name: "Save compliance"}));
	expect(onSave).toHaveBeenCalledTimes(1);
});

test("renders the footer for a model with no checks yet", async () => {
	await render(
		<WorkerProfile
			defaultTab="compliance"
			compliance={{items: [], footer: <button type="button">Save compliance</button>}}
		/>,
	);

	// A model carrying a commit bar is not empty — the empty text would swallow it.
	await expect.element(page.getByRole("button", {name: "Save compliance"})).toBeVisible();
});

test("renders the typed compliance model unchanged without the new API", async () => {
	await render(
		<WorkerProfile
			defaultTab="compliance"
			compliance={{score: {value: 1, total: 2}, items: [{...check, uploadable: true}]}}
		/>,
	);

	await expect.element(page.getByText("Background Check")).toBeVisible();
	await expect.element(page.getByRole("radio", {name: "Pass"})).toBeEnabled();
	await expect.element(page.getByRole("button", {name: "Upload / replace document"})).toBeEnabled();
});

test("survives a host that binds the change handler late", async () => {
	const onOptionChange = vi.fn();
	function Host() {
		// The permissions fetch lands after first paint, so the handler appears on a later render.
		const [canEdit, setCanEdit] = React.useState(false);
		return (
			<>
				<button type="button" onClick={() => setCanEdit(true)}>
					grant
				</button>
				<WorkerProfile
					defaultTab="compliance"
					compliance={{
						items: [{...check, selectedOption: "Pass", onOptionChange: canEdit ? onOptionChange : undefined}],
					}}
				/>
			</>
		);
	}
	const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
	await render(<Host />);

	await userEvent.click(page.getByRole("button", {name: "grant"}));
	// No uncontrolled-to-controlled flip: React stays quiet and the choice on screen survives.
	expect(warn.mock.calls.flat().join(" ")).not.toContain("uncontrolled");
	await expect.element(page.getByRole("radio", {name: "Pass"})).toHaveAttribute("aria-checked", "true");
	warn.mockRestore();

	await userEvent.click(page.getByRole("radio", {name: "Fail"}));
	expect(onOptionChange).toHaveBeenCalledWith("Fail");
});

test("clears a choice on re-press when no handler takes it, as it always did", async () => {
	await render(<WorkerProfile defaultTab="compliance" compliance={{items: [{...check, selectedOption: "Pass"}]}} />);

	await userEvent.click(page.getByRole("radio", {name: "Pass"}));
	await expect.element(page.getByRole("radio", {name: "Pass"})).toHaveAttribute("aria-checked", "false");
});

test("reports an option that is falsy as a string", async () => {
	const onOptionChange = vi.fn();
	await render(
		<WorkerProfile
			defaultTab="compliance"
			compliance={{items: [{id: "z", title: "Rating", options: ["0", "1"], onOptionChange}]}}
		/>,
	);

	await userEvent.click(page.getByRole("radio", {name: "0"}));
	expect(onOptionChange).toHaveBeenCalledWith("0");
});

test("keeps the choice on screen when the host withdraws the handler", async () => {
	function Host() {
		// A permission gate closing mid-session: the check goes from editable to read-only.
		const [editable, setEditable] = React.useState(true);
		const [verdict, setVerdict] = React.useState("Fail");
		return (
			<>
				<button type="button" onClick={() => setEditable(false)}>
					lock
				</button>
				<WorkerProfile
					defaultTab="compliance"
					compliance={{items: [{...check, selectedOption: verdict, onOptionChange: editable ? setVerdict : undefined}]}}
				/>
			</>
		);
	}
	await render(<Host />);

	await userEvent.click(page.getByRole("radio", {name: "Pass"}));
	await expect.element(page.getByRole("radio", {name: "Pass"})).toHaveAttribute("aria-checked", "true");
	await userEvent.click(page.getByRole("button", {name: "lock"}));
	await expect.element(page.getByRole("radio", {name: "Pass"})).toHaveAttribute("aria-checked", "true");
});

// ─── Compliance document (issue #295) ────────────────────────────────────────
// The compliance check's document was `{name, attached?}` only: a host with a presigned URL could
// name the file but never open it, so "View document" sat there as a dead label. These pin the
// parity with the certificate model that closed the gap.

const complianceDoc = (document: Record<string, unknown>) => ({
	defaultTab: "compliance" as const,
	compliance: {items: [{id: "bg", title: "Background Check", document}]},
});

test("links a compliance document to its url", async () => {
	await render(
		<WorkerProfile {...complianceDoc({name: "bg-check.pdf", attached: true, url: "https://example.com/bg.pdf"})} />,
	);
	await expect.element(page.getByText("bg-check.pdf")).toBeVisible();
	await expect
		.element(page.getByRole("link", {name: "View document"}))
		.toHaveAttribute("href", "https://example.com/bg.pdf");
});

test("routes a compliance document click through the host instead of navigating", async () => {
	const onComplianceDocumentClick = vi.fn();
	await render(
		<WorkerProfile
			{...complianceDoc({name: "bg-check.pdf", attached: true, url: "https://example.com/bg.pdf"})}
			onComplianceDocumentClick={onComplianceDocumentClick}
		/>,
	);

	// The handler wins over the url, exactly as it does for a certificate.
	expect(page.getByRole("link", {name: "View document"}).elements()).toHaveLength(0);
	await userEvent.click(page.getByRole("button", {name: "View document"}));
	expect(onComplianceDocumentClick).toHaveBeenCalledTimes(1);
	expect(onComplianceDocumentClick.mock.calls[0]?.[0]).toMatchObject({id: "bg"});
});

test("offers the compliance document handler for a check with no public url", async () => {
	const onComplianceDocumentClick = vi.fn();
	await render(
		<WorkerProfile
			{...complianceDoc({name: "bg-check.pdf", attached: true})}
			onComplianceDocumentClick={onComplianceDocumentClick}
		/>,
	);
	await userEvent.click(page.getByRole("button", {name: "View document"}));
	expect(onComplianceDocumentClick).toHaveBeenCalledTimes(1);
});

test("leaves a compliance document plain text with neither url nor handler", async () => {
	await render(<WorkerProfile {...complianceDoc({name: "bg-check.pdf", attached: true})} />);
	await expect.element(page.getByText("View document")).toBeVisible();
	expect(page.getByRole("link", {name: "View document"}).elements()).toHaveLength(0);
	expect(page.getByRole("button", {name: "View document"}).elements()).toHaveLength(0);
});

test("offers no document affordance when no file is on record", async () => {
	const onComplianceDocumentClick = vi.fn();
	await render(
		<WorkerProfile
			// A url left on a detached record must not become a live link beside "No document".
			{...complianceDoc({name: "bg-check.pdf", attached: false, url: "https://example.com/stale.pdf"})}
			onComplianceDocumentClick={onComplianceDocumentClick}
		/>,
	);
	await expect.element(page.getByText("No document")).toBeVisible();
	expect(page.getByRole("link", {name: "View document"}).elements()).toHaveLength(0);
	expect(page.getByRole("button", {name: "View document"}).elements()).toHaveLength(0);
});

/**
 * Issue #295's "Minor, related": in a narrow profile panel the status chip was cut off at the
 * panel's right edge. The status column cannot shrink — an AUTO badge beside a "NOT SET" chip is
 * ~150px — so the row overflowed once the title's min-content width had nowhere left to go.
 *
 * Measured against the shipped stylesheet, because this is geometry rather than a class list; the
 * rest of this file runs unstyled, where every box would measure zero.
 */
test("keeps a compliance check's status chip inside a narrow panel", async () => {
	const css = (await import("../dist/styles.css?inline")).default as string;
	const style = document.createElement("style");
	style.textContent = css;
	document.head.append(style);
	try {
		await render(
			// Inline width, not an arbitrary Tailwind class: only the utilities the library itself uses
			// are compiled into the shipped CSS, so `w-[240px]` would silently render nothing.
			<div style={{width: 240}}>
				<WorkerProfile
					defaultTab="compliance"
					compliance={{
						items: [{id: "bg", title: "Background Check", auto: true, status: <Badge>NOT SET</Badge>}],
					}}
				/>
			</div>,
		);

		const panel = document.querySelector("[role=tabpanel][data-state=active]") as HTMLElement;
		const heading = document.querySelector("h5") as HTMLElement;
		const row = heading.parentElement as HTMLElement;
		const chip = page.getByText("NOT SET");
		await expect.element(chip).toBeVisible();

		const chipRect = (chip.element() as HTMLElement).getBoundingClientRect();
		const panelRect = panel.getBoundingClientRect();
		expect(panelRect.width).toBeGreaterThan(0);
		expect(chipRect.width).toBeGreaterThan(0);
		// The row fits the panel, and the chip's right edge is inside it. Before the fix the row's
		// scrollWidth ran 23px past the panel and the chip's right edge landed 7px outside it.
		expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
		expect(chipRect.right).toBeLessThanOrEqual(panelRect.right + 0.5);
	} finally {
		style.remove();
	}
});
