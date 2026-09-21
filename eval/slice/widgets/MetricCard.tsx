// The ONE widget impl for the vertical slice. Composes real core-ui components per its manifest
// (composedOf: Card + Typography + Badge). Not a package; the slice's reference implementation.
import { Card, CardContent, CardHeader } from "@core/core-ui/card";
import { TypographyH3, TypographyMuted } from "@core/core-ui/typography";
import { Badge } from "@core/core-ui/badge";

type Delta = { direction: "up" | "down" | "flat"; pct: number };

export default function MetricCard({
	label,
	value,
	delta,
	format = "number",
}: {
	label: string;
	value: number | string;
	delta?: Delta;
	format?: "number" | "currency" | "percent";
}) {
	const formatted =
		format === "currency" ? `$${value}` : format === "percent" ? `${value}%` : String(value);
	return (
		<Card className="wwc:p-4">
			<CardHeader>
				<TypographyMuted>{label}</TypographyMuted>
			</CardHeader>
			<CardContent>
				<TypographyH3>{formatted}</TypographyH3>
				{delta ? (
					<Badge>
						{delta.direction} {delta.pct}%
					</Badge>
				) : null}
			</CardContent>
		</Card>
	);
}
