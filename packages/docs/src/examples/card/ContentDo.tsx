/**
 * Keep card content focused and scannable.
 */
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@corensystem/coren-ui/card";

export function ContentDo() {
	return (
		<Card className="wwc:w-[250px]">
			<CardHeader>
				<CardTitle>Active Users</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="wwc:text-3xl wwc:font-bold">2,350</p>
				<p className="wwc:text-sm wwc:text-green-600">+12% from last month</p>
			</CardContent>
		</Card>
	);
}
