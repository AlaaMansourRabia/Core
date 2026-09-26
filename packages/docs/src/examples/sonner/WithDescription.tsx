/**
 * Toast with title and description.
 */
import {Button} from "@corensystem/coren-ui/button";
import {toast} from "sonner";

export function WithDescription() {
	return (
		<Button
			onClick={() =>
				toast("Event created", {
					description: "Your event has been added to the calendar.",
				})
			}
		>
			Show Toast
		</Button>
	);
}
