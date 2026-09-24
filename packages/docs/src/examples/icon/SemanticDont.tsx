/**
 * Avoid misleading icon choices.
 */
import {Icon} from "@corensystem/coren-ui/icon";
import {Button} from "@corensystem/coren-ui/button";
import {Heart, Star, Moon} from "lucide-react";

export function SemanticDont() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<Button variant="destructive">
				<Icon icon={Heart} className="wwc:mr-2" />
				Delete
			</Button>
			<Button>
				<Icon icon={Star} className="wwc:mr-2" />
				Save
			</Button>
			<Button variant="outline">
				<Icon icon={Moon} className="wwc:mr-2" />
				Add
			</Button>
		</div>
	);
}
