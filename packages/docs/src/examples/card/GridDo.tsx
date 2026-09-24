/**
 * Use consistent card sizes in grids.
 */
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@corensystem/coren-ui/card";

export function GridDo() {
	return (
		<div className="wwc:grid wwc:gap-4 wwc:grid-cols-3">
			<Card>
				<CardHeader>
					<CardTitle>Revenue</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="wwc:text-2xl wwc:font-bold">$45,231</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Orders</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="wwc:text-2xl wwc:font-bold">1,234</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Customers</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="wwc:text-2xl wwc:font-bold">5,678</p>
				</CardContent>
			</Card>
		</div>
	);
}
