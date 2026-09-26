/**
 * Card with interactive hover state.
 */
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@corensystem/coren-ui/card";

export function Interactive() {
	return (
		<div className="wwc:grid wwc:gap-4 wwc:grid-cols-2">
			<Card className="wwc:cursor-pointer wwc:transition-shadow wwc:hover:shadow-lg">
				<CardHeader>
					<CardTitle>Documentation</CardTitle>
					<CardDescription>Learn how to use our platform.</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="wwc:text-sm">Click to view docs →</p>
				</CardContent>
			</Card>

			<Card className="wwc:cursor-pointer wwc:transition-shadow wwc:hover:shadow-lg">
				<CardHeader>
					<CardTitle>API Reference</CardTitle>
					<CardDescription>Explore the API endpoints.</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="wwc:text-sm">Click to view API →</p>
				</CardContent>
			</Card>
		</div>
	);
}
