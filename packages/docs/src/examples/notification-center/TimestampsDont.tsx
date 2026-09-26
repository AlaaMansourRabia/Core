import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid absolute timestamps that require calculation.
 */
import {
	NotificationCenter,
	NotificationCenterTrigger,
	NotificationCenterContent,
	NotificationItem,
} from "@corensystem/coren-ui/notification-center";
import {Bell} from "lucide-react";

export function TimestampsDont() {
	return (
		<NotificationCenter>
			<NotificationCenterTrigger asChild>
				<Button variant="ghost" size="icon">
					<Bell className="wwc:h-5 wwc:w-5" />
				</Button>
			</NotificationCenterTrigger>
			<NotificationCenterContent>
				<NotificationItem title="Message" description="New message received" time="2024-01-15 14:32:45" />
				<NotificationItem title="Update" description="Profile updated" time="2024-01-15 13:15:00" />
			</NotificationCenterContent>
		</NotificationCenter>
	);
}
