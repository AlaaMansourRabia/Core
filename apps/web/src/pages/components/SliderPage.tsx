import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Slider} from "@/components/ui/slider";

export function SliderPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Slider</h1>
					<CopyButton
						value="Slider"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					An input where the user selects a value from within a given range.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Slider - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Slider defaultValue={[50]} max={100} step={1} className="wwc:w-full" />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Steps</CardTitle>
						<CopyButton
							value="Slider - With Steps"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-4">
						<div>
							<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Step: 10</p>
							<Slider defaultValue={[50]} max={100} step={10} />
						</div>
						<div>
							<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Step: 25</p>
							<Slider defaultValue={[50]} max={100} step={25} />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Disabled</CardTitle>
						<CopyButton
							value="Slider - Disabled"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Slider defaultValue={[50]} max={100} step={1} disabled />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Slider - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends Radix UI{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<Slider.Root>"}</code>{" "}
						HTML attributes.
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
									{prop: "defaultValue", type: "number[]", def: "-", desc: "The default value of the slider."},
									{prop: "value", type: "number[]", def: "-", desc: "The controlled value of the slider."},
									{
										prop: "onValueChange",
										type: "(value: number[]) => void",
										def: "-",
										desc: "Callback fired when the value changes.",
									},
									{prop: "min", type: "number", def: "0", desc: "The minimum value of the slider."},
									{prop: "max", type: "number", def: "100", desc: "The maximum value of the slider."},
									{prop: "step", type: "number", def: "1", desc: "The step increment of the slider."},
									{prop: "disabled", type: "boolean", def: "false", desc: "Whether the slider is disabled."},
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
							value="Slider - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Slider } from "@/components/ui/slider"

<Slider defaultValue={[50]} max={100} step={1} />`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
