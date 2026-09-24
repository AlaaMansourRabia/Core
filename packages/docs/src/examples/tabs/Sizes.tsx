/**
 * Tab size variants.
 */
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@corensystem/coren-ui/tabs";

export function Sizes() {
	return (
		<div className="wwc:space-y-8">
			<Tabs defaultValue="tab1" size="sm">
				<TabsList>
					<TabsTrigger value="tab1">Small</TabsTrigger>
					<TabsTrigger value="tab2">Tabs</TabsTrigger>
				</TabsList>
				<TabsContent value="tab1">Small size tabs.</TabsContent>
				<TabsContent value="tab2">Compact spacing.</TabsContent>
			</Tabs>

			<Tabs defaultValue="tab1" size="md">
				<TabsList>
					<TabsTrigger value="tab1">Medium</TabsTrigger>
					<TabsTrigger value="tab2">Tabs</TabsTrigger>
				</TabsList>
				<TabsContent value="tab1">Medium size tabs (default).</TabsContent>
				<TabsContent value="tab2">Standard spacing.</TabsContent>
			</Tabs>

			<Tabs defaultValue="tab1" size="lg">
				<TabsList>
					<TabsTrigger value="tab1">Large</TabsTrigger>
					<TabsTrigger value="tab2">Tabs</TabsTrigger>
				</TabsList>
				<TabsContent value="tab1">Large size tabs.</TabsContent>
				<TabsContent value="tab2">Generous spacing.</TabsContent>
			</Tabs>
		</div>
	);
}
