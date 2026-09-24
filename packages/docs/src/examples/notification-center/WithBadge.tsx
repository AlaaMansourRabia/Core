/**
 * Notification center with unread count.
 */
import {NotificationCenter, NotificationCenterTrigger, NotificationCenterContent, NotificationItem} from "@corensystem/coren-ui/notification-center";
import {Button} from "@corensystem/coren-ui/button";
import {Badge} from "@corensystem/coren-ui/badge";
import {Bell} from "lucide-react";

export function WithBadge() {
	return (
		<NotificationCenter>
			<NotificationCenterTrigger asChild>
				<Button variant="ghost" size="icon" className="wwc:relative">
					<Bell className="wwc:h-5 wwc:w-5" />
					<Badge className="wwc:absolute wwc:-top-1 wwc:-right-1 wwc:h-5 wwc:w-5 wwc:p-0 wwc:flex wwc:items-center wwc:justify-center">
						3
					</Badge>
				</Button>
			</NotificationCenterTrigger>
			<NotificationCenterContent>
				<NotificationItem unread title="New comment" description="Bob commented on your post" time="Just now" />
				<NotificationItem unread title="Mention" description="You were mentioned in a thread" time="5 min ago" />
				<NotificationItem unread title="Update" description="System update completed" time="10 min ago" />
			</NotificationCenterContent>
		</NotificationCenter>
	);
}
