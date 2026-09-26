import {Button} from "@corensystem/coren-ui/button";
/**
 * Visually distinguish notification priority.
 */
import {
	NotificationCenter,
	NotificationCenterTrigger,
	NotificationCenterContent,
	NotificationItem,
} from "@corensystem/coren-ui/notification-center";
import {Bell, AlertCircle} from "lucide-react";

export function PriorityDo() {
	return (
		<NotificationCenter>
			<NotificationCenterTrigger asChild>
				<Button variant="ghost" size="icon">
					<Bell className="wwc:h-5 wwc:w-5" />
				</Button>
			</NotificationCenterTrigger>
			<NotificationCenterContent>
				<NotificationItem
					priority="high"
					icon={<AlertCircle className="wwc:h-4 wwc:w-4 wwc:text-destructive" />}
					title="Security Alert"
					description="Unusual login detected"
					time="Just now"
				/>
				<NotificationItem title="Reminder" description="Meeting starts soon" time="5 min ago" />
			</NotificationCenterContent>
		</NotificationCenter>
	);
}
