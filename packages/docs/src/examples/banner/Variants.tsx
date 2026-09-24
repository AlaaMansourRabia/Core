/**
 * Banner variants for different contexts.
 */
import {Banner} from "@corensystem/coren-ui/banner";
import {Info, AlertTriangle, AlertCircle, CheckCircle} from "lucide-react";

export function Variants() {
	return (
		<div className="wwc:space-y-3">
			<Banner variant="info">
				<Info className="wwc:h-4 wwc:w-4" />
				<span>System maintenance scheduled for tonight.</span>
			</Banner>
			<Banner variant="warning">
				<AlertTriangle className="wwc:h-4 wwc:w-4" />
				<span>Your trial expires in 3 days.</span>
			</Banner>
			<Banner variant="error">
				<AlertCircle className="wwc:h-4 wwc:w-4" />
				<span>Payment failed. Please update your billing info.</span>
			</Banner>
			<Banner variant="success">
				<CheckCircle className="wwc:h-4 wwc:w-4" />
				<span>Your account has been verified.</span>
			</Banner>
		</div>
	);
}
