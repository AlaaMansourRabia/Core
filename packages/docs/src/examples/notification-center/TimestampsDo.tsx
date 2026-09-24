/**
 * Use relative timestamps for recent notifications.
 */
import {NotificationCenter, NotificationCenterTrigger, NotificationCenterContent, NotificationItem} from "@corensystem/coren-ui/notification-center";
import {Button} from "@corensystem/coren-ui/button";
import {Bell} from "lucide-react";

export function TimestampsDo() {
	return (
		<NotificationCenter>
			<NotificationCenterTrigger asChild>
				<Button variant="ghost" size="icon">
					<Bell className="wwc:h-5 wwc:w-5" />
				</Button>
			</NotificationCenterTrigger>
			<NotificationCenterContent>
				<NotificationItem title="Message" description="New message received" time="2 minutes ago" />
				<NotificationItem title="Update" description="Profile updated" time="1 hour ago" />
				<NotificationItem title="Welcome" description="Thanks for signing up" time="3 days ago" />
			</NotificationCenterContent>
		</NotificationCenter>
	);
}
