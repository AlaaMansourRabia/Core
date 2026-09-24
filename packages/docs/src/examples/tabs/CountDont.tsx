/**
 * Avoid too many tabs causing overflow.
 */
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@corensystem/coren-ui/tabs";

export function CountDont() {
	return (
		<Tabs defaultValue="tab1">
			<TabsList className="wwc:flex-wrap">
				<TabsTrigger value="tab1">Tab 1</TabsTrigger>
				<TabsTrigger value="tab2">Tab 2</TabsTrigger>
				<TabsTrigger value="tab3">Tab 3</TabsTrigger>
				<TabsTrigger value="tab4">Tab 4</TabsTrigger>
				<TabsTrigger value="tab5">Tab 5</TabsTrigger>
				<TabsTrigger value="tab6">Tab 6</TabsTrigger>
				<TabsTrigger value="tab7">Tab 7</TabsTrigger>
				<TabsTrigger value="tab8">Tab 8</TabsTrigger>
			</TabsList>
			<TabsContent value="tab1">Too many tabs!</TabsContent>
		</Tabs>
	);
}
