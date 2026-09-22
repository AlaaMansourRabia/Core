import {Button} from "@corensystem/core-ui/button";
import {toast} from "@corensystem/core-ui/sonner";
import {Toaster} from "@corensystem/core-ui/toaster";

export function SettingsForm() {
	return (
		<>
			<Toaster />
			<Button onClick={() => toast.success("Settings saved")}>Save</Button>
		</>
	);
}
