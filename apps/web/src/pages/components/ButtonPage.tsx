import {ChevronRight, Download, Mail, Plus, Send, Trash2} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

export function ButtonPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Button</h1>
					<CopyButton
						value="Button"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">Displays a button or a component that looks like a button.</p>
			</div>

			{/* ── Examples ── */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Examples</CardTitle>
						<CopyButton
							value="Button - Examples"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent className="wwc:space-y-6">
					{/* Variants */}
					<div>
						<p className="wwc:text-[13px] wwc:font-medium wwc:text-foreground wwc:mb-3">Variants</p>
						<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
							<Button>Default</Button>
							<Button variant="secondary">Secondary</Button>
							<Button variant="destructive">Destructive</Button>
							<Button variant="outline">Outline</Button>
							<Button variant="ghost">Ghost</Button>
							<Button variant="link">Link</Button>
						</div>
					</div>

					{/* Sizes */}
					<div>
						<p className="wwc:text-[13px] wwc:font-medium wwc:text-foreground wwc:mb-3">Sizes</p>
						<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
							<Button size="sm">Small</Button>
							<Button size="default">Default</Button>
							<Button size="lg">Large</Button>
						</div>
					</div>

					{/* With Icons */}
					<div>
						<p className="wwc:text-[13px] wwc:font-medium wwc:text-foreground wwc:mb-3">With Icons</p>
						<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
							<Button>
								<Mail /> Login with Email
							</Button>
							<Button variant="secondary">
								Next <ChevronRight />
							</Button>
							<Button variant="outline">
								<Download /> Download
							</Button>
							<Button variant="destructive">
								<Trash2 /> Delete
							</Button>
						</div>
					</div>

					{/* Icon Only */}
					<div>
						<p className="wwc:text-[13px] wwc:font-medium wwc:text-foreground wwc:mb-3">Icon Only</p>
						<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
							<Button icon>
								<Plus />
							</Button>
							<Button icon variant="secondary">
								<Mail />
							</Button>
							<Button icon variant="outline">
								<Download />
							</Button>
							<Button icon variant="ghost">
								<Send />
							</Button>
						</div>
					</div>

					{/* States */}
					<div>
						<p className="wwc:text-[13px] wwc:font-medium wwc:text-foreground wwc:mb-3">Disabled</p>
						<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
							<Button disabled>Default</Button>
							<Button disabled variant="secondary">
								Secondary
							</Button>
							<Button disabled variant="outline">
								Outline
							</Button>
						</div>
					</div>
					<div>
						<p className="wwc:text-[13px] wwc:font-medium wwc:text-foreground wwc:mb-3">Loading</p>
						<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
							<Button loading>Saving...</Button>
							<Button loading variant="secondary">
								Processing...
							</Button>
							<Button loading icon>
								<Plus />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* ── API Reference ── */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Button - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<button>"}</code> HTML
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
									{
										prop: "variant",
										type: '"default" | "secondary" | "destructive" | "outline" | "ghost" | "link"',
										def: '"default"',
										desc: "Visual style of the button.",
									},
									{
										prop: "size",
										type: '"default" | "sm" | "lg" | "icon"',
										def: '"default"',
										desc: "Size of the button. icon renders a square button.",
									},
									{prop: "loading", type: "boolean", def: "false", desc: "Shows a spinner and disables interaction."},
									{prop: "disabled", type: "boolean", def: "false", desc: "Disables the button."},
									{
										prop: "asChild",
										type: "boolean",
										def: "false",
										desc: "Merges props onto the child element instead of rendering a <button>.",
									},
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

			{/* ── Usage ── */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Button - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Button } from "@/components/ui/button"

<Button>Default</Button>
<Button variant="destructive" size="lg">Delete</Button>
<Button loading>Saving...</Button>
<Button icon><Plus /></Button>

// Render as a link
<Button asChild>
  <a href="/dashboard">Dashboard</a>
</Button>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
