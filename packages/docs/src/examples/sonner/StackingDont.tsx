/**
 * Avoid spamming multiple toasts rapidly.
 */
import {Button} from "@corensystem/coren-ui/button";
import {toast} from "sonner";

export function StackingDont() {
	const handleBatchAction = () => {
		// Bad: Individual toast for each item
		toast.success("File 1 uploaded");
		toast.success("File 2 uploaded");
		toast.success("File 3 uploaded");
		toast.success("File 4 uploaded");
		toast.success("File 5 uploaded");
	};

	return (
		<Button onClick={handleBatchAction}>
			Upload 5 Files (Spam)
		</Button>
	);
}
