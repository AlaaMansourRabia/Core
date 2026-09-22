import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@core/core-ui/styles.tw4.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
