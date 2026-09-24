/**
 * Use appropriate duration based on content length.
 */
import {Button} from "@corensystem/coren-ui/button";
import {useToast} from "@corensystem/coren-ui/use-toast";

export function DurationDo() {
	const {toast} = useToast();

	return (
		<div className="wwc:flex wwc:gap-2">
			<Button
				variant="outline"
				onClick={() => {
					toast({
						description: "Saved!",
						duration: 2000,
					});
				}}
			>
				Short (2s)
			</Button>
			<Button
				variant="outline"
				onClick={() => {
					toast({
						title: "Export complete",
						description: "Your report has been exported. Check your downloads folder.",
						duration: 5000,
					});
				}}
			>
				Standard (5s)
			</Button>
		</div>
	);
}
