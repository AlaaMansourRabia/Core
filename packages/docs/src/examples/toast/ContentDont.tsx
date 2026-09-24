/**
 * Avoid lengthy or complex content in toasts.
 */
import {Button} from "@corensystem/coren-ui/button";
import {useToast} from "@corensystem/coren-ui/use-toast";

export function ContentDont() {
	const {toast} = useToast();

	return (
		<Button
			variant="outline"
			onClick={() => {
				toast({
					title: "Network Error Occurred",
					description:
						"We encountered a network connectivity issue while trying to sync your data with our servers. This could be due to your internet connection being unstable, a firewall blocking the connection, or our servers experiencing temporary difficulties. Please check your connection settings and try again.",
				});
			}}
		>
			Show Toast
		</Button>
	);
}
