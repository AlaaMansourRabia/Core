import {Button} from "@corensystem/coren-ui/button";
/**
 * Show helpful empty state.
 */
import {
	NotificationCenter,
	NotificationCenterTrigger,
	NotificationCenterContent,
	NotificationCenterEmpty,
} from "@corensystem/coren-ui/notification-center";
import {Bell, Inbox} from "lucide-react";

export function EmptyDo() {
	return (
		<NotificationCenter>
			<NotificationCenterTrigger asChild>
				<Button variant="ghost" size="icon">
					<Bell className="wwc:h-5 wwc:w-5" />
				</Button>
			</NotificationCenterTrigger>
			<NotificationCenterContent>
				<NotificationCenterEmpty>
					<Inbox className="wwc:h-8 wwc:w-8 wwc:text-muted-foreground" />
					<p className="wwc:text-sm wwc:text-muted-foreground">No notifications yet</p>
					<p className="wwc:text-xs wwc:text-muted-foreground">We'll notify you when something arrives</p>
				</NotificationCenterEmpty>
			</NotificationCenterContent>
		</NotificationCenter>
	);
}
