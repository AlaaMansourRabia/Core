/**
 * Basic card container with header and content.
 */
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@corensystem/coren-ui/card";

export function Default() {
	return (
		<Card className="wwc:w-[350px]">
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card description goes here.</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Card content and body text.</p>
			</CardContent>
		</Card>
	);
}
