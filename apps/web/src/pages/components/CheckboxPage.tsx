import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {CopyButton} from "@/components/ui/copy-button";
import {Label} from "@/components/ui/label";

export function CheckboxPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Checkbox</h1>
					<CopyButton
						value="Checkbox"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A control that allows the user to toggle between checked and not checked.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Checkbox - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:items-center wwc:space-x-2">
						<Checkbox id="terms" />
						<Label htmlFor="terms">Accept terms and conditions</Label>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>States</CardTitle>
						<CopyButton
							value="Checkbox - States"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-4">
						<div className="wwc:flex wwc:items-center wwc:space-x-2">
							<Checkbox id="unchecked" />
							<Label htmlFor="unchecked">Unchecked</Label>
						</div>
						<div className="wwc:flex wwc:items-center wwc:space-x-2">
							<Checkbox id="checked" defaultChecked />
							<Label htmlFor="checked">Checked</Label>
						</div>
						<div className="wwc:flex wwc:items-center wwc:space-x-2">
							<Checkbox id="disabled" disabled />
							<Label htmlFor="disabled" className="wwc:opacity-50">
								Disabled
							</Label>
						</div>
						<div className="wwc:flex wwc:items-center wwc:space-x-2">
							<Checkbox id="disabled-checked" disabled defaultChecked />
							<Label htmlFor="disabled-checked" className="wwc:opacity-50">
								Disabled Checked
							</Label>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Description</CardTitle>
						<CopyButton
							value="Checkbox - With Description"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:items-top wwc:flex wwc:space-x-2">
						<Checkbox id="terms2" />
						<div className="wwc:grid wwc:gap-1.5 wwc:leading-none">
							<Label htmlFor="terms2">Accept terms and conditions</Label>
							<p className="wwc:text-sm wwc:text-muted-foreground">
								You agree to our Terms of Service and Privacy Policy.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Checkbox - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends <code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<button>"}</code>{" "}
						HTML attributes via Radix CheckboxPrimitive.Root.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "checked",
										type: "boolean | 'indeterminate'",
										def: "—",
										desc: "The controlled checked state of the checkbox.",
									},
									{
										prop: "defaultChecked",
										type: "boolean",
										def: "false",
										desc: "The default checked state when uncontrolled.",
									},
									{
										prop: "onCheckedChange",
										type: "(checked: boolean | 'indeterminate') => void",
										def: "—",
										desc: "Callback when the checked state changes.",
									},
									{prop: "disabled", type: "boolean", def: "false", desc: "Whether the checkbox is disabled."},
									{
										prop: "required",
										type: "boolean",
										def: "false",
										desc: "Whether the checkbox is required in a form.",
									},
									{prop: "name", type: "string", def: "—", desc: "The name of the checkbox for form submission."},
									{prop: "value", type: "string", def: '"on"', desc: "The value of the checkbox for form submission."},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Checkbox - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

<div className="wwc:flex wwc:items-center wwc:space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms</Label>
</div>

// States
<Checkbox defaultChecked />
<Checkbox disabled />`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
