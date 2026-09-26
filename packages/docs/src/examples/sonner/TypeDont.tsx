/**
 * Avoid using wrong types for messages.
 */
import {Button} from "@corensystem/coren-ui/button";
import {toast} from "sonner";

export function TypeDont() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<Button
				variant="outline"
				onClick={() => toast.error("Welcome to the app!")}
			>
				Error for Welcome
			</Button>
			<Button
				variant="outline"
				onClick={() => toast.success("Something went wrong")}
			>
				Success for Error
			</Button>
		</div>
	);
}
