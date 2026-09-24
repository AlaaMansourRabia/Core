/**
 * Toast with action button.
 */
import {Button} from "@corensystem/coren-ui/button";
import {toast} from "sonner";

export function WithAction() {
	return (
		<Button
			onClick={() =>
				toast("File deleted", {
					description: "document.pdf has been moved to trash.",
					action: {
						label: "Undo",
						onClick: () => toast.success("File restored"),
					},
				})
			}
		>
			Delete File
		</Button>
	);
}
