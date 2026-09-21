import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Toolbar} from "@/components/ui/toolbar";
import {ToolbarPager} from "@/components/ui/toolbar-pager";

const PAGE_COUNT = 8;

export function ToolbarPagerPage() {
	const [index, setIndex] = useState(1);
	const [embeddedIndex, setEmbeddedIndex] = useState(1);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Toolbar Pager</h1>
					<CopyButton
						value="Toolbar Pager"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Compact prev / <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">i / n</code> / next pager for
					stepping through pages of a multi-page drawing. Uses a 1-based{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">index</code> and disables its ends at the
					bounds.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Toolbar Pager - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Controlled pager over {PAGE_COUNT} pages. Prev/next clamp to the bounds via{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">onIndexChange</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-col wwc:gap-4">
						<ToolbarPager index={index} count={PAGE_COUNT} onIndexChange={setIndex} />
						<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
							index: {index} / {PAGE_COUNT}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Custom labels</CardTitle>
						<CopyButton
							value="Toolbar Pager - Custom labels"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Override <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">prevLabel</code> and{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">nextLabel</code> for accessible tooltips.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ToolbarPager
						index={index}
						count={PAGE_COUNT}
						onIndexChange={setIndex}
						prevLabel="Previous sheet"
						nextLabel="Next sheet"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Embedded in a Toolbar</CardTitle>
						<CopyButton
							value="Toolbar Pager - Embedded"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						The pager is designed to drop into a{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Toolbar</code> alongside other items.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-col wwc:gap-4">
						<Toolbar>
							<ToolbarPager index={embeddedIndex} count={PAGE_COUNT} onIndexChange={setEmbeddedIndex} />
						</Toolbar>
						<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
							index: {embeddedIndex} / {PAGE_COUNT}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Toolbar Pager - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{prop: "index", type: "number", def: "—", desc: "Current 1-based page index."},
									{prop: "count", type: "number", def: "—", desc: "Total number of pages."},
									{
										prop: "onIndexChange",
										type: "(next) => void",
										def: "—",
										desc: "Fires with the next 1-based index when prev/next is clicked.",
									},
									{prop: "prevLabel", type: "string", def: "—", desc: "Accessible label for the previous button."},
									{prop: "nextLabel", type: "string", def: "—", desc: "Accessible label for the next button."},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
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
