/**
 * Avoid toasts that disappear too quickly or persist too long.
 */
import {Button} from "@corensystem/coren-ui/button";
import {useToast} from "@corensystem/coren-ui/use-toast";

export function DurationDont() {
	const {toast} = useToast();

	return (
		<div className="wwc:flex wwc:gap-2">
			<Button
				variant="outline"
				onClick={() => {
					toast({
						title: "Important update",
						description: "Your subscription expires in 3 days. Renew now to avoid service interruption.",
						duration: 1000, // Too short for long content
					});
				}}
			>
				Too Short
			</Button>
			<Button
				variant="outline"
				onClick={() => {
					toast({
						description: "Copied!",
						duration: 30000, // Way too long for simple feedback
					});
				}}
			>
				Too Long
			</Button>
		</div>
	);
}
