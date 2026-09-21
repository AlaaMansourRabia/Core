import {StrictMode} from "react";
import {createRoot} from "react-dom/client";

import {AppInstaller} from "@core/core-ui/pages/core-app-installer";
import "@core/core-ui/styles.css";
import "./fonts.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<div style={{height: "100vh", width: "100%"}}>
			<AppInstaller />
		</div>
	</StrictMode>,
);
