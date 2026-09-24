import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@corensystem/coren-ui/styles.css";
import "./index.css";

import App from "./App";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
