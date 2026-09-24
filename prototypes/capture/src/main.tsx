import {StrictMode} from "react";
import {createRoot} from "react-dom/client";

import {TooltipProvider} from "@corensystem/coren-ui/tooltip";

import "./index.css";
import {Capture} from "./Capture";

// Capture is the whole app here — no Designer Hub chrome, no template viewer. TooltipProvider
// wraps it because the shell (top bar, toolbar actions) uses Radix tooltips.
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<TooltipProvider>
			<Capture />
		</TooltipProvider>
	</StrictMode>,
);
