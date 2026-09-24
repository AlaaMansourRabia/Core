/**
 * Use toasts for transient feedback that doesn't require attention.
 */
import {Button} from "@corensystem/coren-ui/button";
import {useToast} from "@corensystem/coren-ui/use-toast";

export function UsageDo() {
	const {toast} = useToast();

	return (
		<div className="wwc:flex wwc:gap-2">
			<Button
				variant="outline"
				onClick={() => {
					toast({description: "Link copied to clipboard"});
				}}
			>
				Copy Link
			</Button>
			<Button
				variant="outline"
				onClick={() => {
					toast({description: "Draft saved"});
				}}
			>
				Save Draft
			</Button>
		</div>
	);
}
