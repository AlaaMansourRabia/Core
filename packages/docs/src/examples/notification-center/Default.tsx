import {Button} from "@corensystem/coren-ui/button";
/**
 * Basic notification center.
 */
import {
	NotificationCenter,
	NotificationCenterTrigger,
	NotificationCenterContent,
	NotificationItem,
} from "@corensystem/coren-ui/notification-center";
import {Bell} from "lucide-react";

export function Default() {
	return (
		<NotificationCenter>
			<NotificationCenterTrigger asChild>
				<Button variant="ghost" size="icon">
					<Bell className="wwc:h-5 wwc:w-5" />
				</Button>
			</NotificationCenterTrigger>
			<NotificationCenterContent>
				<NotificationItem title="New message" description="You have a new message from Alice" time="2 min ago" />
				<NotificationItem title="Task completed" description="Your export is ready to download" time="1 hour ago" />
			</NotificationCenterContent>
		</NotificationCenter>
	);
}
