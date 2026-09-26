/**
 * Toast with action button.
 */
import {Button} from "@corensystem/coren-ui/button";
import {ToastAction} from "@corensystem/coren-ui/toast";
import {useToast} from "@corensystem/coren-ui/use-toast";

export function WithAction() {
	const {toast} = useToast();

	return (
		<Button
			variant="outline"
			onClick={() => {
				toast({
					title: "File deleted",
					description: "document.pdf has been moved to trash.",
					action: <ToastAction altText="Undo deletion">Undo</ToastAction>,
				});
			}}
		>
			Delete File
		</Button>
	);
}
