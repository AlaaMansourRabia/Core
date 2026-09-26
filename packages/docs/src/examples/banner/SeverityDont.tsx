/**
 * Avoid using error severity for non-critical messages.
 */
import {Banner} from "@corensystem/coren-ui/banner";
import {AlertCircle} from "lucide-react";

export function SeverityDont() {
	return (
		<div className="wwc:space-y-3">
			{/* Error variant used for routine info - crying wolf */}
			<Banner variant="error">
				<AlertCircle className="wwc:h-4 wwc:w-4" />
				<span>Welcome! Check out our new features.</span>
			</Banner>
			<Banner variant="error">
				<AlertCircle className="wwc:h-4 wwc:w-4" />
				<span>Don't forget to complete your profile.</span>
			</Banner>
		</div>
	);
}
