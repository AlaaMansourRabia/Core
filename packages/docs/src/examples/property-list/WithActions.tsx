/**
 * Property list with inline actions.
 */
import {PropertyList, PropertyItem} from "@corensystem/coren-ui/property-list";
import {Button} from "@corensystem/coren-ui/button";
import {Copy, ExternalLink} from "lucide-react";

export function WithActions() {
	return (
		<PropertyList>
			<PropertyItem
				label="API Key"
				action={
					<Button variant="ghost" size="sm">
						<Copy className="wwc:h-4 wwc:w-4" />
					</Button>
				}
			>
				sk-***************1234
			</PropertyItem>
			<PropertyItem
				label="Documentation"
				action={
					<Button variant="ghost" size="sm">
						<ExternalLink className="wwc:h-4 wwc:w-4" />
					</Button>
				}
			>
				docs.example.com
			</PropertyItem>
		</PropertyList>
	);
}
