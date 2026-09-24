/**
 * Use Stack for consistent spacing between elements.
 */
import {Stack} from "@corensystem/coren-ui/stack";
import {Button} from "@corensystem/coren-ui/button";

export function DirectionDo() {
	return (
		<Stack direction="row" gap="sm">
			<Button variant="outline">Cancel</Button>
			<Button>Save</Button>
		</Stack>
	);
}
