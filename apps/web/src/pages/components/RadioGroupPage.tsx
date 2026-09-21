import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

export function RadioGroupPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Radio Group</h1>
					<CopyButton
						value="Radio Group"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a
					time.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Radio Group - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<RadioGroup defaultValue="comfortable">
						<div className="wwc:flex wwc:items-center wwc:space-x-2">
							<RadioGroupItem value="default" id="r1" />
							<Label htmlFor="r1">Default</Label>
						</div>
						<div className="wwc:flex wwc:items-center wwc:space-x-2">
							<RadioGroupItem value="comfortable" id="r2" />
							<Label htmlFor="r2">Comfortable</Label>
						</div>
						<div className="wwc:flex wwc:items-center wwc:space-x-2">
							<RadioGroupItem value="compact" id="r3" />
							<Label htmlFor="r3">Compact</Label>
						</div>
					</RadioGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Description</CardTitle>
						<CopyButton
							value="Radio Group - With Description"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<RadioGroup defaultValue="card">
						<div className="wwc:flex wwc:items-start wwc:space-x-2">
							<RadioGroupItem value="card" id="card" className="wwc:mt-1" />
							<div className="wwc:grid wwc:gap-1">
								<Label htmlFor="card">Card</Label>
								<p className="wwc:text-sm wwc:text-muted-foreground">Pay with your credit or debit card.</p>
							</div>
						</div>
						<div className="wwc:flex wwc:items-start wwc:space-x-2">
							<RadioGroupItem value="paypal" id="paypal" className="wwc:mt-1" />
							<div className="wwc:grid wwc:gap-1">
								<Label htmlFor="paypal">PayPal</Label>
								<p className="wwc:text-sm wwc:text-muted-foreground">Pay using your PayPal account.</p>
							</div>
						</div>
						<div className="wwc:flex wwc:items-start wwc:space-x-2">
							<RadioGroupItem value="apple" id="apple" className="wwc:mt-1" />
							<div className="wwc:grid wwc:gap-1">
								<Label htmlFor="apple">Apple Pay</Label>
								<p className="wwc:text-sm wwc:text-muted-foreground">Pay with Apple Pay on supported devices.</p>
							</div>
						</div>
					</RadioGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Radio Group - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<div>"}</code> HTML
						attributes.
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
									{prop: "defaultValue", type: "string", def: "-", desc: "The default selected value (uncontrolled)."},
									{prop: "value", type: "string", def: "-", desc: "The controlled selected value."},
									{
										prop: "onValueChange",
										type: "(value: string) => void",
										def: "-",
										desc: "Callback when the selected value changes.",
									},
									{prop: "disabled", type: "boolean", def: "false", desc: "Disables all radio items in the group."},
									{
										prop: "orientation",
										type: '"horizontal" | "vertical"',
										def: '"vertical"',
										desc: "The orientation of the radio group.",
									},
									{prop: "className", type: "string", def: "-", desc: "Additional CSS classes for RadioGroup."},
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
							value="Radio Group - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

<RadioGroup defaultValue="option1">
  <div className="wwc:flex wwc:items-center wwc:space-x-2">
    <RadioGroupItem value="option1" id="option1" />
    <Label htmlFor="option1">Option 1</Label>
  </div>
  <div className="wwc:flex wwc:items-center wwc:space-x-2">
    <RadioGroupItem value="option2" id="option2" />
    <Label htmlFor="option2">Option 2</Label>
  </div>
</RadioGroup>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
