/**
 * Tab style variants: default and underline.
 */
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@corensystem/coren-ui/tabs";

export function Variants() {
	return (
		<div className="wwc:space-y-8">
			<Tabs defaultValue="tab1" variant="default">
				<TabsList>
					<TabsTrigger value="tab1">Default</TabsTrigger>
					<TabsTrigger value="tab2">Style</TabsTrigger>
				</TabsList>
				<TabsContent value="tab1">Default pill-style tabs.</TabsContent>
				<TabsContent value="tab2">With muted background.</TabsContent>
			</Tabs>

			<Tabs defaultValue="tab1" variant="underline">
				<TabsList>
					<TabsTrigger value="tab1">Underline</TabsTrigger>
					<TabsTrigger value="tab2">Style</TabsTrigger>
				</TabsList>
				<TabsContent value="tab1">Underline-style tabs.</TabsContent>
				<TabsContent value="tab2">With border indicator.</TabsContent>
			</Tabs>
		</div>
	);
}
