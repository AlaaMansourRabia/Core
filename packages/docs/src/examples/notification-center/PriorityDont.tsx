import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid treating all notifications the same.
 */
import {
	NotificationCenter,
	NotificationCenterTrigger,
	NotificationCenterContent,
	NotificationItem,
} from "@corensystem/coren-ui/notification-center";
import {Bell} from "lucide-react";

export function PriorityDont() {
	return (
		<NotificationCenter>
			<NotificationCenterTrigger asChild>
				<Button variant="ghost" size="icon">
					<Bell className="wwc:h-5 wwc:w-5" />
				</Button>
			</NotificationCenterTrigger>
			<NotificationCenterContent>
				{/* Critical alert looks same as minor update */}
				<NotificationItem title="Security Alert" description="Unusual login detected" time="Just now" />
				<NotificationItem title="Reminder" description="Meeting starts soon" time="5 min ago" />
			</NotificationCenterContent>
		</NotificationCenter>
	);
}
