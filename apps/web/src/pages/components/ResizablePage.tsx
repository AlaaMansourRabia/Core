import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";

export function ResizablePage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Resizable</h1>
					<CopyButton
						value="Resizable"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Accessible resizable panel groups and layouts with keyboard support.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Horizontal</CardTitle>
						<CopyButton
							value="Resizable - Horizontal"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<ResizablePanelGroup
						orientation="horizontal"
						className="wwc:min-h-[200px] wwc:max-w-md wwc:rounded-lg wwc:border"
					>
						<ResizablePanel defaultSize={50}>
							<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
								<span className="wwc:font-semibold">One</span>
							</div>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel defaultSize={50}>
							<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
								<span className="wwc:font-semibold">Two</span>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Vertical</CardTitle>
						<CopyButton
							value="Resizable - Vertical"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<ResizablePanelGroup
						orientation="vertical"
						className="wwc:min-h-[200px] wwc:max-w-md wwc:rounded-lg wwc:border"
					>
						<ResizablePanel defaultSize={25}>
							<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
								<span className="wwc:font-semibold">Header</span>
							</div>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel defaultSize={75}>
							<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
								<span className="wwc:font-semibold">Content</span>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Handle</CardTitle>
						<CopyButton
							value="Resizable - With Handle"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<ResizablePanelGroup
						orientation="horizontal"
						className="wwc:min-h-[200px] wwc:max-w-md wwc:rounded-lg wwc:border"
					>
						<ResizablePanel defaultSize={25}>
							<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
								<span className="wwc:font-semibold">Sidebar</span>
							</div>
						</ResizablePanel>
						<ResizableHandle withHandle />
						<ResizablePanel defaultSize={75}>
							<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
								<span className="wwc:font-semibold">Content</span>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Resizable - API Reference"
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
									{
										prop: "orientation",
										type: '"horizontal" | "vertical"',
										def: '"horizontal"',
										desc: "The orientation of the panel group layout.",
									},
									{
										prop: "defaultSize",
										type: "number",
										def: "-",
										desc: "Default size of a panel as a percentage (ResizablePanel).",
									},
									{
										prop: "minSize",
										type: "number",
										def: "-",
										desc: "Minimum size of a panel as a percentage (ResizablePanel).",
									},
									{
										prop: "maxSize",
										type: "number",
										def: "-",
										desc: "Maximum size of a panel as a percentage (ResizablePanel).",
									},
									{
										prop: "collapsible",
										type: "boolean",
										def: "false",
										desc: "Whether the panel can be collapsed (ResizablePanel).",
									},
									{
										prop: "withHandle",
										type: "boolean",
										def: "false",
										desc: "Show a visible drag handle on the resize separator (ResizableHandle).",
									},
									{prop: "className", type: "string", def: "-", desc: "Additional CSS classes."},
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
							value="Resizable - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

<ResizablePanelGroup orientation="horizontal">
  <ResizablePanel>One</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>Two</ResizablePanel>
</ResizablePanelGroup>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
