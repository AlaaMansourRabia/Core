/**
 * Use clear, concise tab labels.
 */
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@corensystem/coren-ui/tabs";

export function LabelsDo() {
	return (
		<Tabs defaultValue="overview">
			<TabsList>
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="analytics">Analytics</TabsTrigger>
				<TabsTrigger value="reports">Reports</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">Dashboard overview.</TabsContent>
			<TabsContent value="analytics">Usage analytics.</TabsContent>
			<TabsContent value="reports">Generated reports.</TabsContent>
		</Tabs>
	);
}
