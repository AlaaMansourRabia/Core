import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Spinner} from "@/components/ui/spinner";

export function SpinnerPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Spinner</h1>
					<CopyButton
						value="Spinner"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">Loading indicators to show async operations in progress.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Spinner - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Basic spinner with default size.</CardDescription>
				</CardHeader>
				<CardContent>
					<Spinner />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Sizes</CardTitle>
						<CopyButton
							value="Spinner - Sizes"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Available spinner sizes.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:items-center wwc:gap-4">
						<Spinner size="sm" />
						<Spinner size="default" />
						<Spinner size="lg" />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Text</CardTitle>
						<CopyButton
							value="Spinner - With Text"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Spinner size="sm" />
						<span className="wwc:text-sm wwc:text-muted-foreground">Loading...</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>In Button</CardTitle>
						<CopyButton
							value="Spinner - In Button"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<button
						className="wwc:inline-flex wwc:items-center wwc:gap-2 wwc:rounded-md wwc:bg-primary wwc:px-4 wwc:py-2 wwc:text-sm wwc:font-medium wwc:text-primary-foreground"
						disabled
					>
						<Spinner size="sm" className="wwc:text-primary-foreground" />
						Processing...
					</button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Centered Loading State</CardTitle>
						<CopyButton
							value="Spinner - Centered Loading State"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:h-32 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:border">
						<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
							<Spinner size="lg" />
							<span className="wwc:text-sm wwc:text-muted-foreground">Loading content...</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Spinner - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<svg>"}</code> HTML
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
										prop: "size",
										type: '"default" | "sm" | "lg" | "xl"',
										def: '"default"',
										desc: "The size of the spinner.",
									},
									{prop: "className", type: "string", def: "-", desc: "Additional CSS classes to apply."},
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
							value="Spinner - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Spinner } from "@/components/ui/spinner"

// Default
<Spinner />

// Sizes
<Spinner size="sm" />
<Spinner size="default" />
<Spinner size="lg" />

// With text
<div className="wwc:flex wwc:items-center wwc:gap-2">
  <Spinner size="sm" />
  <span>Loading...</span>
</div>

// In button
<Button disabled>
  <Spinner size="sm" />
  Processing...
</Button>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
