/**
 * Use appropriate severity for the message type.
 */
import {Banner} from "@corensystem/coren-ui/banner";
import {Info, AlertCircle} from "lucide-react";

export function SeverityDo() {
	return (
		<div className="wwc:space-y-3">
			{/* Info for non-urgent announcements */}
			<Banner variant="info">
				<Info className="wwc:h-4 wwc:w-4" />
				<span>New dashboard features are now available.</span>
			</Banner>
			{/* Error for critical issues */}
			<Banner variant="error">
				<AlertCircle className="wwc:h-4 wwc:w-4" />
				<span>Unable to connect to server. Retrying...</span>
			</Banner>
		</div>
	);
}
