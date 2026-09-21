import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Kbd} from "@/components/ui/kbd";

export function KbdPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Kbd</h1>
					<CopyButton value="Kbd" className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100" />
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">Display keyboard shortcuts and key combinations.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Single Keys</CardTitle>
						<CopyButton
							value="Kbd - Single Keys"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Individual keyboard keys.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:gap-2">
						<Kbd>⌘</Kbd>
						<Kbd>⇧</Kbd>
						<Kbd>⌥</Kbd>
						<Kbd>⌃</Kbd>
						<Kbd>↵</Kbd>
						<Kbd>⌫</Kbd>
						<Kbd>⎋</Kbd>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Key Combinations</CardTitle>
						<CopyButton
							value="Kbd - Key Combinations"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Common keyboard shortcuts.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-2">
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<span className="wwc:text-sm wwc:text-muted-foreground wwc:w-24">Copy:</span>
							<Kbd>⌘</Kbd>
							<span className="wwc:text-muted-foreground">+</span>
							<Kbd>C</Kbd>
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<span className="wwc:text-sm wwc:text-muted-foreground wwc:w-24">Paste:</span>
							<Kbd>⌘</Kbd>
							<span className="wwc:text-muted-foreground">+</span>
							<Kbd>V</Kbd>
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<span className="wwc:text-sm wwc:text-muted-foreground wwc:w-24">Save:</span>
							<Kbd>⌘</Kbd>
							<span className="wwc:text-muted-foreground">+</span>
							<Kbd>S</Kbd>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Complex Shortcuts</CardTitle>
						<CopyButton
							value="Kbd - Complex Shortcuts"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-2">
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<span className="wwc:text-sm wwc:text-muted-foreground wwc:w-32">Screenshot:</span>
							<Kbd>⌘</Kbd>
							<span className="wwc:text-muted-foreground">+</span>
							<Kbd>⇧</Kbd>
							<span className="wwc:text-muted-foreground">+</span>
							<Kbd>4</Kbd>
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<span className="wwc:text-sm wwc:text-muted-foreground wwc:w-32">Force Quit:</span>
							<Kbd>⌘</Kbd>
							<span className="wwc:text-muted-foreground">+</span>
							<Kbd>⌥</Kbd>
							<span className="wwc:text-muted-foreground">+</span>
							<Kbd>⎋</Kbd>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>In Context</CardTitle>
						<CopyButton
							value="Kbd - In Context"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<p className="wwc:text-sm">
						Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open the command palette, or <Kbd>⎋</Kbd> to close it.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Kbd - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<kbd>"}</code> HTML
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
									{prop: "className", type: "string", def: "-", desc: "Additional CSS classes for the kbd element."},
									{prop: "children", type: "ReactNode", def: "-", desc: "Key label or symbol to display."},
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
							value="Kbd - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Kbd } from "@/components/ui/kbd"

// Single key
<Kbd>⌘</Kbd>

// Key combination
<Kbd>⌘</Kbd> + <Kbd>C</Kbd>

// In text
<p>Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open command palette</p>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
