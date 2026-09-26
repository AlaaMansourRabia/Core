import {Button} from "@corensystem/coren-ui/button";
/**
 * Use encouraging, helpful tone.
 */
import {Empty} from "@corensystem/coren-ui/empty";
import {Users} from "lucide-react";

export function ToneDo() {
	return (
		<Empty
			icon={<Users className="wwc:h-12 wwc:w-12" />}
			title="Build your team"
			description="Invite colleagues to collaborate on projects together."
		>
			<Button>Invite Team Members</Button>
		</Empty>
	);
}
