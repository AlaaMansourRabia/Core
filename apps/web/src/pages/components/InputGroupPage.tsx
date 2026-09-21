import {AtSign, DollarSign, Search} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Input} from "@/components/ui/input";

export function InputGroupPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Input Group</h1>
					<CopyButton
						value="Input Group"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">Combine inputs with addons, icons, and buttons.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Icon</CardTitle>
						<CopyButton
							value="Input Group - With Icon"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Input with an icon positioned inside.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:relative wwc:max-w-sm">
						<Search className="wwc:absolute wwc:left-3 wwc:top-1/2 wwc:h-4 wwc:w-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
						<Input className="wwc:pl-9" placeholder="Search..." />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Left Addon</CardTitle>
						<CopyButton
							value="Input Group - With Left Addon"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Input with a text or icon addon on the left.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:max-w-sm">
						<span className="wwc:inline-flex wwc:items-center wwc:rounded-l-md wwc:border wwc:border-r-0 wwc:bg-muted wwc:px-3 wwc:text-sm wwc:text-muted-foreground">
							<AtSign className="wwc:h-4 wwc:w-4" />
						</span>
						<Input className="wwc:rounded-l-none" placeholder="username" />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Right Addon</CardTitle>
						<CopyButton
							value="Input Group - With Right Addon"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Input with a text addon on the right.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:max-w-sm">
						<Input className="wwc:rounded-r-none" placeholder="0.00" />
						<span className="wwc:inline-flex wwc:items-center wwc:rounded-r-md wwc:border wwc:border-l-0 wwc:bg-muted wwc:px-3 wwc:text-sm wwc:text-muted-foreground">
							USD
						</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Button</CardTitle>
						<CopyButton
							value="Input Group - With Button"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Input combined with a button for form submissions.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:max-w-sm">
						<Input className="wwc:rounded-r-none" placeholder="Enter your email" />
						<Button className="wwc:rounded-l-none">Subscribe</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Currency Input</CardTitle>
						<CopyButton
							value="Input Group - Currency Input"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:relative wwc:max-w-sm">
						<DollarSign className="wwc:absolute wwc:left-3 wwc:top-1/2 wwc:h-4 wwc:w-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
						<Input className="wwc:pl-9" placeholder="0.00" type="number" />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Input Group - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Compound component. Each sub-component extends its native HTML element attributes.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Component</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Element</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{component: "InputGroup", element: "<div>", desc: "Flex container that groups an input with addons."},
									{
										component: "InputGroupText",
										element: "<span>",
										desc: "Text or icon addon with muted background. Auto-rounds first/last child corners.",
									},
								].map((row) => (
									<tr key={row.component} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
											{row.component}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.element}</td>
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
							value="Input Group - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, AtSign } from "lucide-react"

// With icon
<div className="wwc:relative">
  <Search className="wwc:absolute wwc:left-3 wwc:top-1/2 wwc:h-4 wwc:w-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
  <Input className="wwc:pl-9" placeholder="Search..." />
</div>

// With left addon
<div className="wwc:flex">
  <span className="wwc:inline-flex wwc:items-center wwc:rounded-l-md wwc:border wwc:border-r-0 wwc:bg-muted wwc:px-3">
    <AtSign className="wwc:h-4 wwc:w-4" />
  </span>
  <Input className="wwc:rounded-l-none" placeholder="username" />
</div>

// With button
<div className="wwc:flex">
  <Input className="wwc:rounded-r-none" placeholder="Enter email" />
  <Button className="wwc:rounded-l-none">Subscribe</Button>
</div>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
