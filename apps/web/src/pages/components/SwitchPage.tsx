import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";

export function SwitchPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Switch</h1>
					<CopyButton
						value="Switch"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A control that allows the user to toggle between two states.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Switch - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:items-center wwc:space-x-2">
						<Switch id="airplane-mode" />
						<Label htmlFor="airplane-mode">Airplane Mode</Label>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>States</CardTitle>
						<CopyButton
							value="Switch - States"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-4">
						<div className="wwc:flex wwc:items-center wwc:space-x-2">
							<Switch id="off" />
							<Label htmlFor="off">Off</Label>
						</div>
						<div className="wwc:flex wwc:items-center wwc:space-x-2">
							<Switch id="on" defaultChecked />
							<Label htmlFor="on">On</Label>
						</div>
						<div className="wwc:flex wwc:items-center wwc:space-x-2">
							<Switch id="disabled-off" disabled />
							<Label htmlFor="disabled-off" className="wwc:opacity-50">
								Disabled Off
							</Label>
						</div>
						<div className="wwc:flex wwc:items-center wwc:space-x-2">
							<Switch id="disabled-on" disabled defaultChecked />
							<Label htmlFor="disabled-on" className="wwc:opacity-50">
								Disabled On
							</Label>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Switch - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends Radix UI{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<Switch.Root>"}</code>{" "}
						HTML attributes.
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
									{prop: "checked", type: "boolean", def: "-", desc: "The controlled checked state of the switch."},
									{
										prop: "defaultChecked",
										type: "boolean",
										def: "false",
										desc: "The default checked state when uncontrolled.",
									},
									{
										prop: "onCheckedChange",
										type: "(checked: boolean) => void",
										def: "-",
										desc: "Callback fired when the checked state changes.",
									},
									{prop: "disabled", type: "boolean", def: "false", desc: "Whether the switch is disabled."},
									{prop: "required", type: "boolean", def: "false", desc: "Whether the switch is required in a form."},
									{prop: "name", type: "string", def: "-", desc: "The name of the switch for form submission."},
									{prop: "value", type: "string", def: '"on"', desc: "The value of the switch for form submission."},
									{prop: "className", type: "string", def: "-", desc: "Additional CSS classes to apply."},
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
							value="Switch - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

<div className="wwc:flex wwc:items-center wwc:space-x-2">
  <Switch id="mode" />
  <Label htmlFor="mode">Toggle Mode</Label>
</div>

// States
<Switch defaultChecked />
<Switch disabled />`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
