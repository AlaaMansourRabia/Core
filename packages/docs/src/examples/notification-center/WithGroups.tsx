import {Button} from "@corensystem/coren-ui/button";
/**
 * Notification center with grouped notifications.
 */
import {
	NotificationCenter,
	NotificationCenterTrigger,
	NotificationCenterContent,
	NotificationGroup,
	NotificationItem,
} from "@corensystem/coren-ui/notification-center";
import {Bell} from "lucide-react";

export function WithGroups() {
	return (
		<NotificationCenter>
			<NotificationCenterTrigger asChild>
				<Button variant="ghost" size="icon">
					<Bell className="wwc:h-5 wwc:w-5" />
				</Button>
			</NotificationCenterTrigger>
			<NotificationCenterContent>
				<NotificationGroup label="Today">
					<NotificationItem title="Meeting reminder" description="Team standup in 15 minutes" time="9:45 AM" />
				</NotificationGroup>
				<NotificationGroup label="Yesterday">
					<NotificationItem title="Task assigned" description="Review PR #234" time="4:30 PM" />
					<NotificationItem title="Comment" description="New reply on your issue" time="2:15 PM" />
				</NotificationGroup>
			</NotificationCenterContent>
		</NotificationCenter>
	);
}
