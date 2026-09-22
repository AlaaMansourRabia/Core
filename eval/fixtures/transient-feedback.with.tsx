import {Button} from "@core/core-ui/button";
import {toast} from "@core/core-ui/sonner";
import {Toaster} from "@core/core-ui/toaster";

export function SettingsForm() {
	return (
		<>
			<Toaster />
			<Button onClick={() => toast.success("Settings saved")}>Save</Button>
		</>
	);
}
