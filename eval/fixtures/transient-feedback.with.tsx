import {Button} from "@wakecap/core-ui/button";
import {toast} from "@wakecap/core-ui/sonner";
import {Toaster} from "@wakecap/core-ui/toaster";

export function SettingsForm() {
	return (
		<>
			<Toaster />
			<Button onClick={() => toast.success("Settings saved")}>Save</Button>
		</>
	);
}
