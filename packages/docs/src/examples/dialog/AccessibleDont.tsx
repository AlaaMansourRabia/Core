import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid dialogs without title or description.
 */
import {Dialog, DialogContent, DialogTrigger} from "@corensystem/coren-ui/dialog";

export function AccessibleDont() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Open</Button>
			</DialogTrigger>
			<DialogContent>
				<p>Content without title or description.</p>
			</DialogContent>
		</Dialog>
	);
}
