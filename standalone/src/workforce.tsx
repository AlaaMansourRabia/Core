import {StrictMode} from "react";
import {createRoot} from "react-dom/client";

import {Workforce} from "@corensystem/coren-ui/pages/core-workforce";
import "@corensystem/coren-ui/styles.css";
import "./fonts.css";

// `mapStage` is omitted deliberately: the Map View tab needs a 3D/map engine mounted by the host app,
// which a static single file cannot supply. That tab falls back to its placeholder.
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<div style={{height: "100vh", width: "100%"}}>
			<Workforce />
		</div>
	</StrictMode>,
);
