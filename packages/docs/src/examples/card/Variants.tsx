/**
 * Card style variants for different contexts.
 */
import {Card, CardContent, CardHeader, CardTitle} from "@corensystem/coren-ui/card";

export function Variants() {
	return (
		<div className="wwc:grid wwc:gap-4 wwc:grid-cols-2">
			<Card variant="default">
				<CardHeader>
					<CardTitle>Default</CardTitle>
				</CardHeader>
				<CardContent>Standard card with shadow.</CardContent>
			</Card>

			<Card variant="stat">
				<CardHeader>
					<CardTitle>Stat</CardTitle>
				</CardHeader>
				<CardContent>Compact stat tile.</CardContent>
			</Card>

			<Card variant="floating">
				<CardHeader>
					<CardTitle>Floating</CardTitle>
				</CardHeader>
				<CardContent>Glass effect panel.</CardContent>
			</Card>

			<Card variant="floor">
				<CardHeader>
					<CardTitle>Floor</CardTitle>
				</CardHeader>
				<CardContent>Frosted list surface.</CardContent>
			</Card>
		</div>
	);
}
