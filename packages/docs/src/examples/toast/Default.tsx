/**
 * Basic toast notification.
 */
import {Button} from "@corensystem/coren-ui/button";
import {useToast} from "@corensystem/coren-ui/use-toast";

export function Default() {
	const {toast} = useToast();

	return (
		<Button
			onClick={() => {
				toast({
					title: "Scheduled",
					description: "Your meeting has been scheduled.",
				});
			}}
		>
			Show Toast
		</Button>
	);
}
