/**
 * Use toggle for binary on/off actions.
 */
import {Toggle} from "@corensystem/coren-ui/toggle";
import {Bell, BellOff} from "lucide-react";
import * as React from "react";

export function UsageDo() {
	const [muted, setMuted] = React.useState(false);

	return (
		<Toggle pressed={muted} onPressedChange={setMuted} aria-label="Mute notifications">
			{muted ? <BellOff className="wwc:size-4" /> : <Bell className="wwc:size-4" />}
		</Toggle>
	);
}
