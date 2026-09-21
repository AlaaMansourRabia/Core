import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

export function CopyButtonPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Copy Button</h1>
					<CopyButton
						value="Copy Button"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Ghost icon button that writes a string to the clipboard. Swaps to a green check on success for 1.5s
					(configurable).
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Copy Button - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>The minimum API: pass a string to copy to the clipboard.</CardDescription>
				</CardHeader>
				<CardContent>
					<CopyButton value="ToolCall" />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Inline with Heading</CardTitle>
						<CopyButton
							value="Copy Button - Inline with Heading"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Sits next to a heading at a fixed 32×32 footprint so the heading's baseline doesn't shift.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:items-center wwc:gap-3">
						<h2 className="wwc:text-2xl wwc:font-bold">Tool Call</h2>
						<CopyButton value="Tool Call" />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Hover Reveal</CardTitle>
						<CopyButton
							value="Copy Button - Hover Reveal"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Wrap the row in a <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">wwc:group</code> parent
						and add <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">wwc:opacity-0</code>{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">wwc:group-hover:opacity-100</code> on the
						button.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-md wwc:space-y-2">
						<p className="wwc:text-sm wwc:text-muted-foreground">
							Hover the row below — the button only appears on hover.
						</p>
						<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3 wwc:rounded-md wwc:border wwc:px-3 wwc:py-2">
							<span className="wwc:text-sm wwc:font-semibold">Search Filter Bar</span>
							<CopyButton
								value="Search Filter Bar"
								className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>In a List</CardTitle>
						<CopyButton
							value="Copy Button - In a List"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Common pattern: a list of credentials/codes with a copy affordance per row.</CardDescription>
				</CardHeader>
				<CardContent>
					<ul className="wwc:max-w-md wwc:divide-y wwc:rounded-md wwc:border">
						{["sk-live-1234567890abcdef", "sk-test-abcdefghij1234567", "rk-secret-9876543210xxxx"].map((token) => (
							<li key={token} className="wwc:flex wwc:items-center wwc:gap-2 wwc:px-3 wwc:py-2">
								<code className="wwc:flex-1 wwc:truncate wwc:font-mono wwc:text-xs">{token}</code>
								<CopyButton value={token} label="Copy token" />
							</li>
						))}
					</ul>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Copy Button - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
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
									{prop: "value", type: "string", def: "—", desc: "The string to copy to the clipboard."},
									{
										prop: "label",
										type: "string",
										def: '"Copy"',
										desc: "Accessible label. Override when value would be long, sensitive, or unhelpful as an aria-label.",
									},
									{
										prop: "resetMs",
										type: "number",
										def: "1500",
										desc: "How long (ms) the success state shows before reverting.",
									},
									{prop: "className", type: "string", def: "—", desc: "Optional class to merge with the button."},
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
		</div>
	);
}
