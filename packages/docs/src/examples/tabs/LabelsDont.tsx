/**
 * Avoid verbose or abbreviated tab labels.
 */
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@corensystem/coren-ui/tabs";

export function LabelsDont() {
	return (
		<Tabs defaultValue="tab1">
			<TabsList>
				<TabsTrigger value="tab1">Dashboard Overview Page</TabsTrigger>
				<TabsTrigger value="tab2">Anlytcs</TabsTrigger>
				<TabsTrigger value="tab3">Rpts</TabsTrigger>
			</TabsList>
			<TabsContent value="tab1">Too long or abbreviated labels.</TabsContent>
			<TabsContent value="tab2">Hard to scan.</TabsContent>
			<TabsContent value="tab3">Unclear meaning.</TabsContent>
		</Tabs>
	);
}
