/**
 * Different toast notification types.
 */
import {Button} from "@corensystem/coren-ui/button";
import {toast} from "sonner";

export function Variants() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
			<Button variant="outline" onClick={() => toast("Default notification")}>
				Default
			</Button>
			<Button variant="outline" onClick={() => toast.success("Action completed!")}>
				Success
			</Button>
			<Button variant="outline" onClick={() => toast.error("Something went wrong")}>
				Error
			</Button>
			<Button variant="outline" onClick={() => toast.warning("Please check your input")}>
				Warning
			</Button>
			<Button variant="outline" onClick={() => toast.info("Here's some info")}>
				Info
			</Button>
		</div>
	);
}
