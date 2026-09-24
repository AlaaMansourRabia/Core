/**
 * Use consistent card structure with header, content, footer.
 */
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@corensystem/coren-ui/card";
import {Button} from "@corensystem/coren-ui/button";

export function StructureDo() {
	return (
		<Card className="wwc:w-[350px]">
			<CardHeader>
				<CardTitle>Subscription Plan</CardTitle>
				<CardDescription>Your current plan and usage.</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="wwc:space-y-2">
					<p className="wwc:text-2xl wwc:font-bold">Pro Plan</p>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						5,000 / 10,000 API calls used
					</p>
				</div>
			</CardContent>
			<CardFooter>
				<Button className="wwc:w-full">Upgrade Plan</Button>
			</CardFooter>
		</Card>
	);
}
