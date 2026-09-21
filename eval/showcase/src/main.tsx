import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
// The pre-built core-ui stylesheet (TW4 flavor) — same import the tw4 playground uses.
import "@wakecap/core-ui/styles.tw4.css";
import {Viewer} from "./Viewer";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Viewer />
	</StrictMode>,
);
