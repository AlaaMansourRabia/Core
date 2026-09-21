import {AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline} from "lucide-react";

import {ButtonGroup, ButtonGroupItem} from "@/components/ui/button-group";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

export function ButtonGroupPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Button Group</h1>
					<CopyButton
						value="Button Group"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Group related buttons together with a unified border and spacing.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Button Group - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Basic button group with text labels.</CardDescription>
				</CardHeader>
				<CardContent>
					<ButtonGroup>
						<ButtonGroupItem>Left</ButtonGroupItem>
						<ButtonGroupItem>Center</ButtonGroupItem>
						<ButtonGroupItem>Right</ButtonGroupItem>
					</ButtonGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Icons</CardTitle>
						<CopyButton
							value="Button Group - With Icons"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Icon-only button group for compact toolbars.</CardDescription>
				</CardHeader>
				<CardContent>
					<ButtonGroup>
						<ButtonGroupItem>
							<Bold />
						</ButtonGroupItem>
						<ButtonGroupItem>
							<Italic />
						</ButtonGroupItem>
						<ButtonGroupItem>
							<Underline />
						</ButtonGroupItem>
					</ButtonGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Alignment Controls</CardTitle>
						<CopyButton
							value="Button Group - Alignment Controls"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<ButtonGroup>
						<ButtonGroupItem>
							<AlignLeft />
						</ButtonGroupItem>
						<ButtonGroupItem>
							<AlignCenter />
						</ButtonGroupItem>
						<ButtonGroupItem>
							<AlignRight />
						</ButtonGroupItem>
					</ButtonGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Icon with Text</CardTitle>
						<CopyButton
							value="Button Group - Icon with Text"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<ButtonGroup>
						<ButtonGroupItem>
							<Bold />
							Bold
						</ButtonGroupItem>
						<ButtonGroupItem>
							<Italic />
							Italic
						</ButtonGroupItem>
						<ButtonGroupItem>
							<Underline />
							Underline
						</ButtonGroupItem>
					</ButtonGroup>
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Button Group - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<div>"}</code> HTML
						attributes (ButtonGroup) and{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<button>"}</code> HTML
						attributes (ButtonGroupItem).
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
										prop: "className",
										type: "string",
										def: "—",
										desc: "Additional CSS class names for ButtonGroup container.",
									},
									{
										prop: "children",
										type: "ReactNode",
										def: "—",
										desc: "ButtonGroupItem elements to render inside the group.",
									},
									{prop: "disabled", type: "boolean", def: "false", desc: "Disable a ButtonGroupItem."},
									{prop: "onClick", type: "() => void", def: "—", desc: "Click handler for a ButtonGroupItem."},
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
							value="Button Group - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { ButtonGroup, ButtonGroupItem } from "@/components/ui/button-group"

// Basic button group
<ButtonGroup>
  <ButtonGroupItem>Left</ButtonGroupItem>
  <ButtonGroupItem>Center</ButtonGroupItem>
  <ButtonGroupItem>Right</ButtonGroupItem>
</ButtonGroup>

// With icons
<ButtonGroup>
  <ButtonGroupItem><Bold /></ButtonGroupItem>
  <ButtonGroupItem><Italic /></ButtonGroupItem>
  <ButtonGroupItem><Underline /></ButtonGroupItem>
</ButtonGroup>

// Icon with text
<ButtonGroup>
  <ButtonGroupItem>
    <Bold />
    Bold
  </ButtonGroupItem>
</ButtonGroup>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
