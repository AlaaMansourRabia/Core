/**
 * Avoid inconsistent card heights in grids.
 */
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@corensystem/coren-ui/card";

export function GridDont() {
	return (
		<div className="wwc:grid wwc:gap-4 wwc:grid-cols-3 wwc:items-start">
			<Card>
				<CardHeader>
					<CardTitle>Short</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Brief content.</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Much Longer Card</CardTitle>
				</CardHeader>
				<CardContent>
					<p>This card has much more content than the others.</p>
					<p>It creates an uneven visual grid.</p>
					<p>Consider using equal height cards.</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Medium</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Some content here.</p>
				</CardContent>
			</Card>
		</div>
	);
}
