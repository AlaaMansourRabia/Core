import {useEffect, useState} from "react";

import {Home} from "./Home";
import {Preview} from "./Preview";

// WakeCore Studio — the read-only front door to WakeCore. Home browses and searches the canonical
// catalog; Preview renders an approved template with the real WakeCore renderer. Studio does not edit,
// converse, or run an agent — editing happens externally and reaches Studio only after review + merge.
type View = {kind: "home"} | {kind: "preview"; templateId: string};

export default function App() {
	const [view, setView] = useState<View>({kind: "home"});

	// Follow the theme of a host shell (e.g. the WakeCore Hub) when embedded in an
	// iframe. The host posts {type: "wc-set-theme", dark} on load and on toggle.
	useEffect(() => {
		function onMessage(e: MessageEvent) {
			if (e.data && e.data.type === "wc-set-theme") {
				document.documentElement.classList.toggle("dark", Boolean(e.data.dark));
			}
		}
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, []);

	return view.kind === "home" ? (
		<Home onOpen={(templateId) => setView({kind: "preview", templateId})} />
	) : (
		<Preview templateId={view.templateId} onHome={() => setView({kind: "home"})} />
	);
}
