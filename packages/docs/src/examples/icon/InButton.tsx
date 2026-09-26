import {Button} from "@corensystem/coren-ui/button";
/**
 * Icons inside buttons.
 */
import {Icon} from "@corensystem/coren-ui/icon";
import {Plus, Download, Send} from "lucide-react";

export function InButton() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<Button>
				<Icon icon={Plus} className="wwc:mr-2" />
				Add Item
			</Button>
			<Button variant="outline">
				<Icon icon={Download} className="wwc:mr-2" />
				Download
			</Button>
			<Button variant="secondary">
				<Icon icon={Send} className="wwc:mr-2" />
				Send
			</Button>
		</div>
	);
}
