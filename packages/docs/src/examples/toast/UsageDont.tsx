/**
 * Avoid using toasts for critical errors or required actions.
 */
import {Button} from "@corensystem/coren-ui/button";
import {useToast} from "@corensystem/coren-ui/use-toast";

export function UsageDont() {
	const {toast} = useToast();

	return (
		<Button
			variant="destructive"
			onClick={() => {
				// Critical errors should use Alert or Dialog, not Toast
				toast({
					variant: "destructive",
					title: "Payment Failed",
					description: "Your card was declined. Update payment method.",
					// User may miss this - should be a persistent Alert
				});
			}}
		>
			Process Payment
		</Button>
	);
}
