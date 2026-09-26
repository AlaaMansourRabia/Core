/**
 * Use ordered list for sequential steps.
 */
import {List, ListItem} from "@corensystem/coren-ui/list";

export function SemanticDo() {
	return (
		<List ordered className="wwc:w-[180px]">
			<ListItem>Create account</ListItem>
			<ListItem>Verify email</ListItem>
			<ListItem>Start using</ListItem>
		</List>
	);
}
