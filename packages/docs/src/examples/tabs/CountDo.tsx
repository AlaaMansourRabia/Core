/**
 * Limit tabs to a reasonable number.
 */
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@corensystem/coren-ui/tabs";

export function CountDo() {
	return (
		<Tabs defaultValue="general">
			<TabsList>
				<TabsTrigger value="general">General</TabsTrigger>
				<TabsTrigger value="security">Security</TabsTrigger>
				<TabsTrigger value="notifications">Notifications</TabsTrigger>
				<TabsTrigger value="billing">Billing</TabsTrigger>
			</TabsList>
			<TabsContent value="general">General settings.</TabsContent>
			<TabsContent value="security">Security options.</TabsContent>
			<TabsContent value="notifications">Notification preferences.</TabsContent>
			<TabsContent value="billing">Billing information.</TabsContent>
		</Tabs>
	);
}
