/**
 * Toast variations with and without title.
 */
import {Button} from "@corensystem/coren-ui/button";
import {useToast} from "@corensystem/coren-ui/use-toast";

export function WithTitle() {
	const {toast} = useToast();

	return (
		<div className="wwc:flex wwc:gap-2">
			<Button
				variant="outline"
				onClick={() => {
					toast({
						title: "Settings updated",
						description: "Your preferences have been saved successfully.",
					});
				}}
			>
				With Title
			</Button>
			<Button
				variant="outline"
				onClick={() => {
					toast({
						description: "Your message has been sent.",
					});
				}}
			>
				Description Only
			</Button>
		</div>
	);
}
