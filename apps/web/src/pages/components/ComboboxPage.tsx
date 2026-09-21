import * as React from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Combobox} from "@/components/ui/combobox";
import {CopyButton} from "@/components/ui/copy-button";

const frameworks = [
	{value: "next.js", label: "Next.js"},
	{value: "sveltekit", label: "SvelteKit"},
	{value: "nuxt.js", label: "Nuxt.js"},
	{value: "remix", label: "Remix"},
	{value: "astro", label: "Astro"},
];

const countries = [
	{value: "us", label: "United States"},
	{value: "uk", label: "United Kingdom"},
	{value: "ca", label: "Canada"},
	{value: "au", label: "Australia"},
	{value: "de", label: "Germany"},
	{value: "fr", label: "France"},
	{value: "jp", label: "Japan"},
];

export function ComboboxPage() {
	const [framework, setFramework] = React.useState("");
	const [country, setCountry] = React.useState("");

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Combobox</h1>
					<CopyButton
						value="Combobox"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">Autocomplete input with a dropdown list of options.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Combobox - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Basic combobox with searchable options.</CardDescription>
				</CardHeader>
				<CardContent>
					<Combobox
						options={frameworks}
						value={framework}
						onValueChange={setFramework}
						placeholder="Select framework..."
						searchPlaceholder="Search framework..."
					/>
					{framework && (
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-2">
							Selected: {frameworks.find((f) => f.value === framework)?.label}
						</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Countries</CardTitle>
						<CopyButton
							value="Combobox - Countries"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Combobox with custom width and empty message.</CardDescription>
				</CardHeader>
				<CardContent>
					<Combobox
						options={countries}
						value={country}
						onValueChange={setCountry}
						placeholder="Select country..."
						searchPlaceholder="Search country..."
						emptyMessage="No country found."
						className="wwc:w-[280px]"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Disabled</CardTitle>
						<CopyButton
							value="Combobox - Disabled"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Combobox in disabled state.</CardDescription>
				</CardHeader>
				<CardContent>
					<Combobox options={frameworks} placeholder="Disabled combobox" disabled />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Disabled Options</CardTitle>
						<CopyButton
							value="Combobox - With Disabled Options"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Some options can be individually disabled.</CardDescription>
				</CardHeader>
				<CardContent>
					<Combobox
						options={[
							{value: "option1", label: "Available Option"},
							{value: "option2", label: "Disabled Option", disabled: true},
							{value: "option3", label: "Another Available"},
						]}
						placeholder="Select option..."
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Combobox - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Custom component props (not extending a native element).</CardDescription>
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
										prop: "options",
										type: "ComboboxOption[]",
										def: "—",
										desc: "Array of selectable options ({ value, label, disabled? }).",
									},
									{prop: "value", type: "string", def: "—", desc: "The controlled selected value."},
									{
										prop: "onValueChange",
										type: "(value: string) => void",
										def: "—",
										desc: "Callback when the selected value changes.",
									},
									{
										prop: "placeholder",
										type: "string",
										def: '"Select option..."',
										desc: "Placeholder text shown when no value is selected.",
									},
									{
										prop: "searchPlaceholder",
										type: "string",
										def: '"Search..."',
										desc: "Placeholder text for the search input.",
									},
									{
										prop: "emptyMessage",
										type: "string",
										def: '"No option found."',
										desc: "Message shown when no options match the search.",
									},
									{prop: "className", type: "string", def: "—", desc: "Additional CSS classes for the trigger button."},
									{prop: "disabled", type: "boolean", def: "false", desc: "Whether the combobox is disabled."},
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
							value="Combobox - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Combobox } from "@/components/ui/combobox"

const options = [
  { value: "next.js", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
]

const [value, setValue] = useState("")

// Basic usage
<Combobox
  options={options}
  value={value}
  onValueChange={setValue}
  placeholder="Select framework..."
  searchPlaceholder="Search..."
/>

// With custom empty message
<Combobox
  options={options}
  emptyMessage="No results found."
/>

// With disabled options
<Combobox
  options={[
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B", disabled: true },
  ]}
/>

// Disabled combobox
<Combobox options={options} disabled />`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
