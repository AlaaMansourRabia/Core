import {CalendarDays} from "lucide-react";

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";

export function HoverCardPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Hover Card</h1>
					<CopyButton
						value="Hover Card"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					For sighted users to preview content available behind a link.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Hover Card - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<HoverCard>
						<HoverCardTrigger asChild>
							<Button variant="link">@nextjs</Button>
						</HoverCardTrigger>
						<HoverCardContent className="wwc:w-80">
							<div className="wwc:flex wwc:justify-between wwc:space-x-4">
								<Avatar>
									<AvatarImage src="https://github.com/vercel.png" />
									<AvatarFallback>VC</AvatarFallback>
								</Avatar>
								<div className="wwc:space-y-1">
									<h4 className="wwc:text-sm wwc:font-semibold">@nextjs</h4>
									<p className="wwc:text-sm">The React Framework – created and maintained by @vercel.</p>
									<div className="wwc:flex wwc:items-center wwc:pt-2">
										<CalendarDays className="wwc:mr-2 wwc:h-4 wwc:w-4 wwc:opacity-70" />
										<span className="wwc:text-xs wwc:text-muted-foreground">Joined December 2021</span>
									</div>
								</div>
							</div>
						</HoverCardContent>
					</HoverCard>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Hover Card - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Built on Radix UI HoverCard primitives.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Component</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{prop: "HoverCardContent", type: "", def: "", desc: "—", component: true},
									{
										prop: "align",
										type: '"start" | "center" | "end"',
										def: '"center"',
										desc: "Preferred alignment against the trigger.",
									},
									{prop: "sideOffset", type: "number", def: "4", desc: "Distance in px from the trigger."},
								].map((row, i) => (
									<tr key={`${row.prop}-${i}`} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										{row.component ? (
											<td colSpan={5} className="wwc:py-3 wwc:font-mono wwc:text-primary wwc:font-semibold">
												{row.prop}
											</td>
										) : (
											<>
												<td className="wwc:py-3 wwc:pr-4" />
												<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
													{row.prop}
												</td>
												<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
												<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
												<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
											</>
										)}
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
							value="Hover Card - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

<HoverCard>
  <HoverCardTrigger>Hover</HoverCardTrigger>
  <HoverCardContent>
    Content shown on hover
  </HoverCardContent>
</HoverCard>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
