/**
 * Keep banner messages concise and actionable.
 */
import {Banner} from "@corensystem/coren-ui/banner";
import {Button} from "@corensystem/coren-ui/button";
import {AlertTriangle} from "lucide-react";

export function ContentDo() {
	return (
		<Banner variant="warning">
			<AlertTriangle className="wwc:h-4 wwc:w-4" />
			<span className="wwc:flex-1">Your password expires in 3 days.</span>
			<Button size="sm" variant="outline">
				Update Now
			</Button>
		</Banner>
	);
}
