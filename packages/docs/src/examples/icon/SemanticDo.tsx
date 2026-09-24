/**
 * Use icons that match the action.
 */
import {Icon} from "@corensystem/coren-ui/icon";
import {Button} from "@corensystem/coren-ui/button";
import {Trash2, Save, Plus} from "lucide-react";

export function SemanticDo() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<Button variant="destructive">
				<Icon icon={Trash2} className="wwc:mr-2" />
				Delete
			</Button>
			<Button>
				<Icon icon={Save} className="wwc:mr-2" />
				Save
			</Button>
			<Button variant="outline">
				<Icon icon={Plus} className="wwc:mr-2" />
				Add
			</Button>
		</div>
	);
}
