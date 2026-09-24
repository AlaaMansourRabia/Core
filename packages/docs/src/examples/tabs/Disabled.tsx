/**
 * Tabs with disabled items.
 */
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@corensystem/coren-ui/tabs";

export function Disabled() {
	return (
		<Tabs defaultValue="active">
			<TabsList>
				<TabsTrigger value="active">Active</TabsTrigger>
				<TabsTrigger value="pending">Pending</TabsTrigger>
				<TabsTrigger value="archived" disabled>
					Archived
				</TabsTrigger>
			</TabsList>
			<TabsContent value="active">Active items.</TabsContent>
			<TabsContent value="pending">Pending items.</TabsContent>
			<TabsContent value="archived">Archived items.</TabsContent>
		</Tabs>
	);
}
