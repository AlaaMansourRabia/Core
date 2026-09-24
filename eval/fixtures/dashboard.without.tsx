import {Card, CardContent, CardHeader, CardTitle} from "@corensystem/coren-ui";

export function OrgOverview({kpis}) {
	return (
		<div className="grid grid-cols-4 gap-4">
			{kpis.map((k) => (
				<Card key={k.label}>
					<CardHeader>
						<CardTitle>{k.label}</CardTitle>
					</CardHeader>
					<CardContent>{k.value}</CardContent>
				</Card>
			))}
		</div>
	);
}
