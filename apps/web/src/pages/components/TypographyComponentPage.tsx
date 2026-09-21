import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

export function TypographyComponentPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Typography</h1>
					<CopyButton
						value="Typography"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Styles for headings, paragraphs, lists, and other text elements.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Headings</CardTitle>
						<CopyButton
							value="Typography - Headings"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Heading styles from h1 to h4.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-4">
						<h1 className="wwc:scroll-m-20 wwc:text-4xl wwc:font-extrabold wwc:tracking-tight wwc:lg:text-5xl">
							Heading 1
						</h1>
						<h2 className="wwc:scroll-m-20 wwc:text-3xl wwc:font-semibold wwc:tracking-tight">Heading 2</h2>
						<h3 className="wwc:scroll-m-20 wwc:text-2xl wwc:font-semibold wwc:tracking-tight">Heading 3</h3>
						<h4 className="wwc:scroll-m-20 wwc:text-xl wwc:font-semibold wwc:tracking-tight">Heading 4</h4>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Paragraph</CardTitle>
						<CopyButton
							value="Typography - Paragraph"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Standard paragraph text.</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="wwc:leading-7 wwc:[&:not(:first-child)]:mt-6">
						The king, seeing how much happier his subjects were, realized the error of his ways and repealed the joke
						tax. The people rejoiced, and the kingdom was once again filled with laughter.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Lead Paragraph</CardTitle>
						<CopyButton
							value="Typography - Lead Paragraph"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Larger text for introductions.</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="wwc:text-xl wwc:text-muted-foreground">
						A modal dialog that interrupts the user with important content and expects a response.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Text Sizes</CardTitle>
						<CopyButton
							value="Typography - Text Sizes"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Large, small, and muted text styles.</CardDescription>
				</CardHeader>
				<CardContent className="wwc:space-y-4">
					<div>
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-1">Large:</p>
						<div className="wwc:text-lg wwc:font-semibold">Are you absolutely sure?</div>
					</div>
					<div>
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-1">Small:</p>
						<small className="wwc:text-sm wwc:font-medium wwc:leading-none">Email address</small>
					</div>
					<div>
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-1">Muted:</p>
						<p className="wwc:text-sm wwc:text-muted-foreground">Enter your email address.</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Blockquote</CardTitle>
						<CopyButton
							value="Typography - Blockquote"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Styled quotation block.</CardDescription>
				</CardHeader>
				<CardContent>
					<blockquote className="wwc:border-l-2 wwc:pl-6 wwc:italic">
						"After all," he said, "everyone enjoys a good joke, so it's only fair that they should pay for the
						privilege."
					</blockquote>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Inline Code</CardTitle>
						<CopyButton
							value="Typography - Inline Code"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Code within text.</CardDescription>
				</CardHeader>
				<CardContent>
					<p>
						Use the{" "}
						<code className="wwc:relative wwc:rounded wwc:bg-muted wwc:px-[0.3rem] wwc:py-[0.2rem] wwc:font-mono wwc:text-sm wwc:font-semibold">
							@radix-ui/react-alert-dialog
						</code>{" "}
						package.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Lists</CardTitle>
						<CopyButton
							value="Typography - Lists"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Unordered and ordered lists.</CardDescription>
				</CardHeader>
				<CardContent className="wwc:space-y-6">
					<div>
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Unordered:</p>
						<ul className="wwc:ml-6 wwc:list-disc wwc:[&>li]:mt-2">
							<li>First item in the list</li>
							<li>Second item in the list</li>
							<li>Third item in the list</li>
						</ul>
					</div>
					<div>
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Ordered:</p>
						<ol className="wwc:ml-6 wwc:list-decimal wwc:[&>li]:mt-2">
							<li>First step</li>
							<li>Second step</li>
							<li>Third step</li>
						</ol>
					</div>
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Typography - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Each typography component extends its corresponding native HTML element attributes.
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
										prop: "TypographyH1",
										type: "HTMLHeadingElement attrs",
										def: "—",
										desc: "Heading 1 — 4xl/5xl extrabold with tight tracking.",
									},
									{
										prop: "TypographyH2",
										type: "HTMLHeadingElement attrs",
										def: "—",
										desc: "Heading 2 — 3xl semibold with bottom border.",
									},
									{
										prop: "TypographyH3",
										type: "HTMLHeadingElement attrs",
										def: "—",
										desc: "Heading 3 — 2xl semibold with tight tracking.",
									},
									{
										prop: "TypographyH4",
										type: "HTMLHeadingElement attrs",
										def: "—",
										desc: "Heading 4 — xl semibold with tight tracking.",
									},
									{
										prop: "TypographyP",
										type: "HTMLParagraphElement attrs",
										def: "—",
										desc: "Paragraph with leading-7 spacing.",
									},
									{
										prop: "TypographyBlockquote",
										type: "HTMLQuoteElement attrs",
										def: "—",
										desc: "Styled blockquote with left border.",
									},
									{
										prop: "TypographyInlineCode",
										type: "HTMLElement attrs",
										def: "—",
										desc: "Inline code with muted background.",
									},
									{
										prop: "TypographyLead",
										type: "HTMLParagraphElement attrs",
										def: "—",
										desc: "Lead paragraph — xl muted text for intros.",
									},
									{prop: "TypographyLarge", type: "HTMLDivElement attrs", def: "—", desc: "Large text — lg semibold."},
									{
										prop: "TypographySmall",
										type: "HTMLElement attrs",
										def: "—",
										desc: "Small text — sm medium with no leading.",
									},
									{
										prop: "TypographyMuted",
										type: "HTMLParagraphElement attrs",
										def: "—",
										desc: "Muted text — sm with muted foreground color.",
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

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Typography - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`// Heading 1
<h1 className="wwc:scroll-m-20 wwc:text-4xl wwc:font-extrabold wwc:tracking-tight wwc:lg:text-5xl">
  Heading 1
</h1>

// Paragraph
<p className="wwc:leading-7 wwc:[&:not(:first-child)]:mt-6">
  Your paragraph text here.
</p>

// Lead paragraph
<p className="wwc:text-xl wwc:text-muted-foreground">
  Introductory text here.
</p>

// Blockquote
<blockquote className="wwc:border-l-2 wwc:pl-6 wwc:italic">
  "Your quote here."
</blockquote>

// Inline code
<code className="wwc:rounded wwc:bg-muted wwc:px-[0.3rem] wwc:py-[0.2rem] wwc:font-mono wwc:text-sm">
  code
</code>

// Lists
<ul className="wwc:ml-6 wwc:list-disc wwc:[&>li]:mt-2">
  <li>Item</li>
</ul>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
