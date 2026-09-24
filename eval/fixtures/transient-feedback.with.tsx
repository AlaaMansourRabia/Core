import {Button} from "@corensystem/coren-ui/button";
import {toast} from "@corensystem/coren-ui/sonner";
import {Toaster} from "@corensystem/coren-ui/toaster";

export function SettingsForm() {
	return (
		<>
			<Toaster />
			<Button onClick={() => toast.success("Settings saved")}>Save</Button>
		</>
	);
}
