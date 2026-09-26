/**
 * Use semantic types for different message purposes.
 */
import {Button} from "@corensystem/coren-ui/button";
import {toast} from "sonner";

export function TypeDo() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<Button variant="outline" onClick={() => toast.success("Changes saved successfully")}>
				Save
			</Button>
			<Button variant="outline" onClick={() => toast.error("Failed to connect to server")}>
				Error
			</Button>
		</div>
	);
}
