import {Alert, AlertDescription, AlertTitle} from "@corensystem/core-ui/alert";
import {Button} from "@corensystem/core-ui/button";
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
