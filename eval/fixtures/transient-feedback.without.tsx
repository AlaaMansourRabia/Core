import {Alert, AlertDescription, AlertTitle} from "@wakecap/core-ui/alert";
import {Button} from "@wakecap/core-ui/button";
import {useState} from "react";

export function SettingsForm() {
	const [saved, setSaved] = useState(false);
	return (
		<>
			{saved && (
				<Alert>
					<AlertTitle>Saved</AlertTitle>
					<AlertDescription>Settings saved</AlertDescription>
				</Alert>
			)}
			<Button onClick={() => setSaved(true)}>Save</Button>
		</>
	);
}
