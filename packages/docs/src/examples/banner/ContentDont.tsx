/**
 * Avoid lengthy or complex banner messages.
 */
import {Banner} from "@corensystem/coren-ui/banner";
import {AlertTriangle} from "lucide-react";

export function ContentDont() {
	return (
		<Banner variant="warning">
			<AlertTriangle className="wwc:h-4 wwc:w-4 wwc:shrink-0" />
			<span>
				We noticed that your password is set to expire in approximately 3 days from now. For security reasons, we
				strongly recommend that you update your password as soon as possible to avoid any interruption to your service.
				Please navigate to your account settings page and follow the instructions to create a new password.
			</span>
		</Banner>
	);
}
