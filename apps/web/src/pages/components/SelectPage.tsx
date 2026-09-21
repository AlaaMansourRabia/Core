import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Label} from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
	SearchableSelect,
	MultiSelect,
} from "@/components/ui/select";

const COUNTRIES = [
	{value: "sa", label: "Saudi Arabia"},
	{value: "ae", label: "United Arab Emirates"},
	{value: "eg", label: "Egypt"},
	{value: "jo", label: "Jordan"},
	{value: "kw", label: "Kuwait"},
	{value: "bh", label: "Bahrain"},
	{value: "om", label: "Oman"},
	{value: "qa", label: "Qatar"},
	{value: "iq", label: "Iraq"},
	{value: "lb", label: "Lebanon"},
];

const ROLES = [
	{value: "admin", label: "Admin"},
	{value: "editor", label: "Editor"},
	{value: "viewer", label: "Viewer"},
	{value: "moderator", label: "Moderator"},
	{value: "contributor", label: "Contributor"},
	{value: "guest", label: "Guest", disabled: true},
];

export function SelectPage() {
	const [country, setCountry] = useState("");
	const [roles, setRoles] = useState<string[]>(["admin", "editor"]);
	const [countries, setCountries] = useState<string[]>(["sa", "ae"]);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Select</h1>
					<CopyButton
						value="Select"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Displays a list of options for the user to pick from—triggered by a button.
				</p>
			</div>

			{/* Default */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Select - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Select>
						<SelectTrigger className="wwc:w-[220px]">
							<SelectValue placeholder="Select a fruit" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Fruits</SelectLabel>
								<SelectItem value="apple">Apple</SelectItem>
								<SelectItem value="banana">Banana</SelectItem>
								<SelectItem value="blueberry">Blueberry</SelectItem>
								<SelectItem value="grapes">Grapes</SelectItem>
								<SelectItem value="pineapple">Pineapple</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			{/* With Label */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Label</CardTitle>
						<CopyButton
							value="Select - With Label"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-2">
						<Label htmlFor="framework">Framework</Label>
						<Select>
							<SelectTrigger id="framework" className="wwc:w-[220px]">
								<SelectValue placeholder="Select" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="next">Next.js</SelectItem>
								<SelectItem value="remix">Remix</SelectItem>
								<SelectItem value="astro">Astro</SelectItem>
								<SelectItem value="gatsby">Gatsby</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Searchable */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Searchable Select</CardTitle>
						<CopyButton
							value="Select - Searchable Select"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>A select with built-in search to filter options.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-2">
						<Label>Country</Label>
						<SearchableSelect
							options={COUNTRIES}
							value={country}
							onValueChange={setCountry}
							placeholder="Select country..."
							searchPlaceholder="Search countries..."
							className="wwc:w-[220px]"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Multi Select */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Multi Select</CardTitle>
						<CopyButton
							value="Select - Multi Select"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Select multiple options with checkboxes, search, and clear all.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-2">
						<Label>Roles</Label>
						<MultiSelect
							options={ROLES}
							value={roles}
							onValueChange={setRoles}
							placeholder="Select roles..."
							searchPlaceholder="Search roles..."
							className="wwc:w-[280px]"
						/>
						{roles.length > 0 && <p className="wwc:text-sm wwc:text-muted-foreground">Selected: {roles.join(", ")}</p>}
					</div>
				</CardContent>
			</Card>

			{/* Multi Select with Tags */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Multi Select with Tags</CardTitle>
						<CopyButton
							value="Select - Multi Select with Tags"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Selected items appear as removable tags in the trigger. Enable with{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">showTags</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-2">
						<Label>Countries</Label>
						<MultiSelect
							options={COUNTRIES}
							value={countries}
							onValueChange={setCountries}
							placeholder="Select countries..."
							searchPlaceholder="Search countries..."
							className="wwc:w-[320px]"
							maxDisplay={2}
							showTags
						/>
						{countries.length > 0 && (
							<p className="wwc:text-sm wwc:text-muted-foreground">Selected: {countries.join(", ")}</p>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Disabled */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Disabled</CardTitle>
						<CopyButton
							value="Select - Disabled"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:gap-4">
						<Select disabled>
							<SelectTrigger className="wwc:w-[220px]">
								<SelectValue placeholder="Select" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="option">Option</SelectItem>
							</SelectContent>
						</Select>
						<SearchableSelect options={COUNTRIES} placeholder="Disabled" className="wwc:w-[220px]" disabled />
						<MultiSelect options={ROLES} placeholder="Disabled" className="wwc:w-[220px]" disabled />
					</div>
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Select - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent className="wwc:space-y-6">
					<div>
						<p className="wwc:text-[13px] wwc:font-semibold wwc:text-foreground wwc:mb-2">Select</p>
						<p className="wwc:text-[13px] wwc:text-muted-foreground wwc:mb-3">
							Radix-based select. Extends native{" "}
							<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<button>"}</code>{" "}
							attributes.
						</p>
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
										{prop: "value", type: "string", def: "—", desc: "Controlled selected value."},
										{prop: "defaultValue", type: "string", def: "—", desc: "Default value (uncontrolled)."},
										{
											prop: "onValueChange",
											type: "(value: string) => void",
											def: "—",
											desc: "Callback when value changes.",
										},
										{prop: "disabled", type: "boolean", def: "false", desc: "Disables the select."},
										{prop: "placeholder", type: "string", def: "—", desc: "Placeholder text (via SelectValue)."},
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
					</div>

					<div>
						<p className="wwc:text-[13px] wwc:font-semibold wwc:text-foreground wwc:mb-2">SearchableSelect</p>
						<p className="wwc:text-[13px] wwc:text-muted-foreground wwc:mb-3">
							Single select with built-in search filtering.
						</p>
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
											type: "{ value: string; label: string; disabled?: boolean }[]",
											def: "—",
											desc: "Array of options.",
										},
										{prop: "value", type: "string", def: "—", desc: "Controlled selected value."},
										{
											prop: "onValueChange",
											type: "(value: string) => void",
											def: "—",
											desc: "Callback when value changes.",
										},
										{prop: "placeholder", type: "string", def: '"Select..."', desc: "Placeholder text."},
										{prop: "searchPlaceholder", type: "string", def: '"Search..."', desc: "Search input placeholder."},
										{prop: "emptyMessage", type: "string", def: '"No results found."', desc: "Shown when no matches."},
										{prop: "disabled", type: "boolean", def: "false", desc: "Disables the select."},
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
					</div>

					<div>
						<p className="wwc:text-[13px] wwc:font-semibold wwc:text-foreground wwc:mb-2">MultiSelect</p>
						<p className="wwc:text-[13px] wwc:text-muted-foreground wwc:mb-3">
							Select multiple options with checkboxes, search, and clear all.
						</p>
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
											type: "{ value: string; label: string; disabled?: boolean }[]",
											def: "—",
											desc: "Array of options.",
										},
										{prop: "value", type: "string[]", def: "[]", desc: "Controlled selected values."},
										{
											prop: "onValueChange",
											type: "(value: string[]) => void",
											def: "—",
											desc: "Callback when values change.",
										},
										{prop: "placeholder", type: "string", def: '"Select..."', desc: "Placeholder text."},
										{prop: "searchPlaceholder", type: "string", def: '"Search..."', desc: "Search input placeholder."},
										{prop: "emptyMessage", type: "string", def: '"No results found."', desc: "Shown when no matches."},
										{prop: "maxDisplay", type: "number", def: "3", desc: "Max labels/tags shown before +N."},
										{
											prop: "showTags",
											type: "boolean",
											def: "false",
											desc: "Show selected items as removable tags in the trigger.",
										},
										{prop: "disabled", type: "boolean", def: "false", desc: "Disables the select."},
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
					</div>
				</CardContent>
			</Card>

			{/* Usage */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Select - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  SearchableSelect,
  MultiSelect,
} from "@/components/ui/select"

// Basic
<Select>
  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
  </SelectContent>
</Select>

// Searchable
<SearchableSelect
  options={[{value: "sa", label: "Saudi Arabia"}, ...]}
  value={country}
  onValueChange={setCountry}
  placeholder="Select country..."
/>

// Multi Select
<MultiSelect
  options={[{value: "admin", label: "Admin"}, ...]}
  value={roles}
  onValueChange={setRoles}
  placeholder="Select roles..."
/>

// Multi Select with Tags
<MultiSelect
  options={options}
  value={selected}
  onValueChange={setSelected}
  showTags
  maxDisplay={2}
/>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
