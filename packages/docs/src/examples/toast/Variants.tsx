/**
 * Toast with different semantic variants.
 */
import {Button} from "@corensystem/coren-ui/button";
import {useToast} from "@corensystem/coren-ui/use-toast";

export function Variants() {
	const {toast} = useToast();

	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
			<Button
				variant="outline"
				onClick={() => {
					toast({
						title: "Success",
						description: "Your changes have been saved.",
					});
				}}
			>
				Default
			</Button>
			<Button
				variant="outline"
				onClick={() => {
					toast({
						variant: "destructive",
						title: "Error",
						description: "Something went wrong. Please try again.",
					});
				}}
			>
				Destructive
			</Button>
		</div>
	);
}
