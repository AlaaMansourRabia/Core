import {AspectRatio} from "@/components/ui/aspect-ratio";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

export function AspectRatioPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Aspect Ratio</h1>
					<CopyButton
						value="Aspect Ratio"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">Displays content within a desired ratio.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>16:9 Ratio</CardTitle>
						<CopyButton
							value="Aspect Ratio - 16:9 Ratio"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:w-[450px]">
						<AspectRatio
							ratio={16 / 9}
							className="wwc:bg-muted wwc:rounded-md wwc:flex wwc:items-center wwc:justify-center"
						>
							<span className="wwc:text-muted-foreground">16:9</span>
						</AspectRatio>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Various Ratios</CardTitle>
						<CopyButton
							value="Aspect Ratio - Various Ratios"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:grid wwc:grid-cols-3 wwc:gap-4">
						<div>
							<AspectRatio
								ratio={1}
								className="wwc:bg-muted wwc:rounded-md wwc:flex wwc:items-center wwc:justify-center"
							>
								<span className="wwc:text-muted-foreground wwc:text-sm">1:1</span>
							</AspectRatio>
						</div>
						<div>
							<AspectRatio
								ratio={4 / 3}
								className="wwc:bg-muted wwc:rounded-md wwc:flex wwc:items-center wwc:justify-center"
							>
								<span className="wwc:text-muted-foreground wwc:text-sm">4:3</span>
							</AspectRatio>
						</div>
						<div>
							<AspectRatio
								ratio={16 / 9}
								className="wwc:bg-muted wwc:rounded-md wwc:flex wwc:items-center wwc:justify-center"
							>
								<span className="wwc:text-muted-foreground wwc:text-sm">16:9</span>
							</AspectRatio>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Aspect Ratio - API Reference"
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
									{prop: "ratio", type: "number", def: "1", desc: "The desired width-to-height ratio (e.g. 16/9)."},
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
							value="Aspect Ratio - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { AspectRatio } from "@/components/ui/aspect-ratio"

<AspectRatio ratio={16 / 9}>
  <img src="..." alt="..." className="wwc:object-cover" />
</AspectRatio>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
