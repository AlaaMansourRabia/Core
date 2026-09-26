/**
 * Avoid mismatched duration for content length.
 */
import {Button} from "@corensystem/coren-ui/button";
import {toast} from "sonner";

export function DurationDont() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<Button
				variant="outline"
				onClick={() =>
					toast(
						"Your subscription will expire in 3 days. Please renew to avoid service interruption.",
						{duration: 1000} // Too short for long message
					)
				}
			>
				Too Short
			</Button>
			<Button
				variant="outline"
				onClick={() =>
					toast("Done!", {duration: 30000}) // Way too long for simple message
				}
			>
				Too Long
			</Button>
		</div>
	);
}
