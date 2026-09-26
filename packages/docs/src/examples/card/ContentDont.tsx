/**
 * Avoid cramming too much content into a card.
 */
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@corensystem/coren-ui/card";

export function ContentDont() {
	return (
		<Card className="wwc:w-[250px]">
			<CardHeader>
				<CardTitle>User Statistics</CardTitle>
			</CardHeader>
			<CardContent className="wwc:text-sm wwc:space-y-1">
				<p>Total Users: 2,350</p>
				<p>Active: 1,892</p>
				<p>New This Month: 234</p>
				<p>Churned: 45</p>
				<p>Growth Rate: 12%</p>
				<p>Avg Session: 4m 32s</p>
				<p>Page Views: 15,230</p>
				<p>Bounce Rate: 34%</p>
				{/* Too much data for a card */}
			</CardContent>
		</Card>
	);
}
