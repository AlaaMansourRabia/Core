import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid blank empty states.
 */
import {
	NotificationCenter,
	NotificationCenterTrigger,
	NotificationCenterContent,
} from "@corensystem/coren-ui/notification-center";
import {Bell} from "lucide-react";

export function EmptyDont() {
	return (
		<NotificationCenter>
			<NotificationCenterTrigger asChild>
				<Button variant="ghost" size="icon">
					<Bell className="wwc:h-5 wwc:w-5" />
				</Button>
			</NotificationCenterTrigger>
			<NotificationCenterContent className="wwc:min-h-[100px]">
				{/* Empty - no indication of what to expect */}
			</NotificationCenterContent>
		</NotificationCenter>
	);
}
