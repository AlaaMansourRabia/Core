/**
 * Avoid multiple primary buttons that compete for attention.
 */
import {Button} from "@corensystem/coren-ui/button";

export function HierarchyDont() {
	return (
		<div className="wwc:flex wwc:gap-3">
			<Button>Submit</Button>
			<Button>Save Draft</Button>
			<Button>Preview</Button>
		</div>
	);
}
