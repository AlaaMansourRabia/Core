/**
 * Keep toast content brief and actionable.
 */
import {Button} from "@corensystem/coren-ui/button";
import {ToastAction} from "@corensystem/coren-ui/toast";
import {useToast} from "@corensystem/coren-ui/use-toast";

export function ContentDo() {
	const {toast} = useToast();

	return (
		<Button
			variant="outline"
			onClick={() => {
				toast({
					title: "Connection lost",
					description: "Check your internet connection.",
					action: <ToastAction altText="Retry connection">Retry</ToastAction>,
				});
			}}
		>
			Show Toast
		</Button>
	);
}
