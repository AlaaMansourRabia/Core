import {Card, CardContent, CardHeader, CardTitle} from "@corensystem/core-ui/card";
import {ChartContainer} from "@corensystem/core-ui/chart";
import {Skeleton} from "@corensystem/core-ui/skeleton";

export function OrgOverview({kpis, loading, chartOption}) {
	if (loading) return <Skeleton className="wwc:h-40" />;
	return (
		<div className="wwc:grid wwc:gap-4">
			<div className="wwc:grid wwc:grid-cols-4 wwc:gap-4">
				{kpis.map((k) => (
					<Card key={k.label}>
						<CardHeader>
							<CardTitle>{k.label}</CardTitle>
						</CardHeader>
						<CardContent>{k.value}</CardContent>
					</Card>
				))}
			</div>
			<ChartContainer option={chartOption} style={{height: 300}} />
		</div>
	);
}
