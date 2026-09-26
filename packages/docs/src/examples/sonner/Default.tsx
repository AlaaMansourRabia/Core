/**
 * Basic sonner toast notification.
 */
import {Button} from "@corensystem/coren-ui/button";
import {toast} from "sonner";

export function Default() {
	return <Button onClick={() => toast("Event has been created")}>Show Toast</Button>;
}
