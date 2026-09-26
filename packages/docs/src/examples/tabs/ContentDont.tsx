/**
 * Avoid using tabs for sequential workflow steps.
 */
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@corensystem/coren-ui/tabs";

export function ContentDont() {
	return (
		<Tabs defaultValue="step1">
			<TabsList>
				<TabsTrigger value="step1">Step 1</TabsTrigger>
				<TabsTrigger value="step2">Step 2</TabsTrigger>
				<TabsTrigger value="step3">Step 3</TabsTrigger>
			</TabsList>
			<TabsContent value="step1">First step of the wizard. Use a stepper component instead.</TabsContent>
			<TabsContent value="step2">Second step.</TabsContent>
			<TabsContent value="step3">Third step.</TabsContent>
		</Tabs>
	);
}
