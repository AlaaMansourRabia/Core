/**
 * Use tabs for related but distinct content sections.
 */
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@corensystem/coren-ui/tabs";

export function ContentDo() {
	return (
		<Tabs defaultValue="details">
			<TabsList>
				<TabsTrigger value="details">Details</TabsTrigger>
				<TabsTrigger value="activity">Activity</TabsTrigger>
				<TabsTrigger value="comments">Comments</TabsTrigger>
			</TabsList>
			<TabsContent value="details">
				<div className="wwc:space-y-2">
					<p className="wwc:font-medium">Project Details</p>
					<p className="wwc:text-sm wwc:text-muted-foreground">Related information about this project.</p>
				</div>
			</TabsContent>
			<TabsContent value="activity">Activity log.</TabsContent>
			<TabsContent value="comments">User comments.</TabsContent>
		</Tabs>
	);
}
