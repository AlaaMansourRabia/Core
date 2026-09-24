/**
 * Basic tabs for content organization.
 */
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@corensystem/coren-ui/tabs";

export function Default() {
	return (
		<Tabs defaultValue="account" className="wwc:w-[400px]">
			<TabsList>
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
				<TabsTrigger value="settings">Settings</TabsTrigger>
			</TabsList>
			<TabsContent value="account">
				<p className="wwc:text-sm wwc:text-muted-foreground">
					Manage your account settings and preferences.
				</p>
			</TabsContent>
			<TabsContent value="password">
				<p className="wwc:text-sm wwc:text-muted-foreground">
					Change your password and security settings.
				</p>
			</TabsContent>
			<TabsContent value="settings">
				<p className="wwc:text-sm wwc:text-muted-foreground">
					Configure application settings.
				</p>
			</TabsContent>
		</Tabs>
	);
}
