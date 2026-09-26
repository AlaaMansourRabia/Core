/**
 * Buttons with leading or trailing icons.
 */
import {Button} from "@corensystem/coren-ui/button";
import {Mail, ArrowRight, Plus} from "lucide-react";

export function WithIcon() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Button>
				<Mail className="wwc:size-4" />
				Send Email
			</Button>
			<Button variant="secondary">
				Continue
				<ArrowRight className="wwc:size-4" />
			</Button>
			<Button icon>
				<Plus className="wwc:size-4" />
			</Button>
		</div>
	);
}
