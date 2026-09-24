/**
 * Empty state with call-to-action button.
 */
import {Empty} from "@corensystem/coren-ui/empty";
import {Button} from "@corensystem/coren-ui/button";
import {Inbox, Plus} from "lucide-react";

export function WithAction() {
	return (
		<Empty
			icon={<Inbox className="wwc:h-12 wwc:w-12" />}
			title="Your inbox is empty"
			description="Messages from your team will appear here."
		>
			<Button>
				<Plus className="wwc:mr-2 wwc:h-4 wwc:w-4" />
				Compose Message
			</Button>
		</Empty>
	);
}
