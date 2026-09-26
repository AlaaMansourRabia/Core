/**
 * Avoid overly verbose alert content.
 */
import {Alert, AlertDescription, AlertTitle} from "@corensystem/coren-ui/alert";
import {Info} from "lucide-react";

export function ContentDont() {
	return (
		<Alert>
			<Info className="wwc:h-4 wwc:w-4" />
			<AlertTitle>System Update Notification</AlertTitle>
			<AlertDescription>
				We are pleased to inform you that a new version of our application,
				version 2.0, is now available for download. This update includes
				numerous bug fixes, performance improvements, and exciting new features
				that we believe will enhance your user experience significantly.
			</AlertDescription>
		</Alert>
	);
}
