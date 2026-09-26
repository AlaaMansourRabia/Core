import {Button} from "@corensystem/coren-ui/button";
/**
 * Card with footer actions.
 */
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@corensystem/coren-ui/card";

export function WithFooter() {
	return (
		<Card className="wwc:w-[350px]">
			<CardHeader>
				<CardTitle>Create Project</CardTitle>
				<CardDescription>Deploy your new project in one-click.</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="wwc:text-sm wwc:text-muted-foreground">Your project will be created with default settings.</p>
			</CardContent>
			<CardFooter className="wwc:flex wwc:justify-between">
				<Button variant="outline">Cancel</Button>
				<Button>Deploy</Button>
			</CardFooter>
		</Card>
	);
}
