/**
 * Notification center with action buttons.
 */
import {NotificationCenter, NotificationCenterTrigger, NotificationCenterContent, NotificationItem, NotificationCenterHeader} from "@corensystem/coren-ui/notification-center";
import {Button} from "@corensystem/coren-ui/button";
import {Bell} from "lucide-react";

export function WithActions() {
	return (
		<NotificationCenter>
			<NotificationCenterTrigger asChild>
				<Button variant="ghost" size="icon">
					<Bell className="wwc:h-5 wwc:w-5" />
				</Button>
			</NotificationCenterTrigger>
			<NotificationCenterContent>
				<NotificationCenterHeader>
					<span className="wwc:font-semibold">Notifications</span>
					<Button variant="ghost" size="sm">Mark all read</Button>
				</NotificationCenterHeader>
				<NotificationItem
					title="Invitation"
					description="Alice invited you to Project X"
					time="Just now"
					actions={
						<div className="wwc:flex wwc:gap-2">
							<Button size="sm">Accept</Button>
							<Button size="sm" variant="outline">Decline</Button>
						</div>
					}
				/>
			</NotificationCenterContent>
		</NotificationCenter>
	);
}
