import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {TurnTimer} from "@/components/ui/turn-timer";

export function TurnTimerPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Turn Timer</h1>
					<CopyButton
						value="Turn Timer"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Mono-text duration counter. Live during work (spinning ring + ticking), frozen + de-emphasised when complete
					(solid dim dot, 70% opacity).
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Live</CardTitle>
						<CopyButton
							value="Turn Timer - Live"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Live state — ticks every 100ms, spinning ring dot, full opacity.</CardDescription>
				</CardHeader>
				<CardContent>
					<TurnTimer />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Done</CardTitle>
						<CopyButton
							value="Turn Timer - Done"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Done state — solid dim dot, no animation, frozen final duration, 70% opacity.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TurnTimer done value="8.5s" />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Done — Range of Values</CardTitle>
						<CopyButton
							value="Turn Timer - Done Values"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Final duration baked into the value prop.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-4">
						<TurnTimer done value="0.4s" />
						<TurnTimer done value="2.4s" />
						<TurnTimer done value="8.5s" />
						<TurnTimer done value="12.7s" />
						<TurnTimer done value="42.0s" />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Side by Side</CardTitle>
						<CopyButton
							value="Turn Timer - Side by Side"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Compare live and done states.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-col wwc:gap-4">
						<div className="wwc:flex wwc:items-center wwc:gap-4">
							<span className="wwc:w-16 wwc:text-xs wwc:text-muted-foreground">Live:</span>
							<TurnTimer />
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-4">
							<span className="wwc:w-16 wwc:text-xs wwc:text-muted-foreground">Done:</span>
							<TurnTimer done value="8.5s" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Turn Timer - API Reference"
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
									{
										prop: "done",
										type: "boolean",
										def: "false",
										desc: 'When true, freezes the timer and applies the de-emphasised "done" style.',
									},
									{prop: "value", type: "string", def: "—", desc: "Frozen final duration to display when done."},
									{
										prop: "tickIntervalMs",
										type: "number",
										def: "100",
										desc: "How often the live timer increments its visible value.",
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
		</div>
	);
}
