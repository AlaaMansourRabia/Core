/**
 * Use appropriate duration for message importance.
 */
import {Button} from "@corensystem/coren-ui/button";
import {toast} from "sonner";

export function DurationDo() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<Button
				variant="outline"
				onClick={() => toast.success("Saved!", {duration: 2000})}
			>
				Quick (2s)
			</Button>
			<Button
				variant="outline"
				onClick={() =>
					toast.error("Failed to save. Please try again.", {
						duration: 5000,
					})
				}
			>
				Error (5s)
			</Button>
		</div>
	);
}
