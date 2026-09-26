import {Banner} from "@corensystem/coren-ui/banner";
import {Button} from "@corensystem/coren-ui/button";
import {Megaphone, X} from "lucide-react";
/**
 * Dismissible banner with close button.
 */
import * as React from "react";

export function Dismissible() {
	const [visible, setVisible] = React.useState(true);

	if (!visible) {
		return (
			<Button variant="outline" size="sm" onClick={() => setVisible(true)}>
				Show Banner
			</Button>
		);
	}

	return (
		<Banner>
			<Megaphone className="wwc:h-4 wwc:w-4" />
			<span className="wwc:flex-1">We've updated our privacy policy.</span>
			<Button variant="ghost" size="icon" className="wwc:h-6 wwc:w-6" onClick={() => setVisible(false)}>
				<X className="wwc:h-4 wwc:w-4" />
			</Button>
		</Banner>
	);
}
