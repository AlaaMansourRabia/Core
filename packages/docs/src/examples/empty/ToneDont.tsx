/**
 * Avoid negative or unhelpful messaging.
 */
import {Empty} from "@corensystem/coren-ui/empty";
import {Users} from "lucide-react";

export function ToneDont() {
	return (
		<Empty
			icon={<Users className="wwc:h-12 wwc:w-12" />}
			title="No team members"
			description="You haven't added anyone to your team yet. You're all alone."
			// Negative tone discourages users
		/>
	);
}
