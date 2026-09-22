// A live Core thumbnail — the real template compiled + rendered by the Core renderer, scaled
// into a card. These aren't screenshots, they're Core running. Rendered lazily (only when scrolled
// into view) so a grid of heavy pages (maps, charts) doesn't compile + mount all at once.
import {useEffect, useRef, useState} from "react";

import {loadCompiled} from "./lib/preview";

const shell = `<!doctype html><html><head><meta charset="utf-8"><base href="${window.location.origin}/">
<link rel="stylesheet" href="/vendor/core-render.css">
<style>html,body{margin:0;background:#fff}#r{width:1200px;height:760px}</style></head>
<body><div id="r"></div><script src="/vendor/core-render.js"></script>
<script>window.addEventListener("message",function(e){if(e&&e.data&&e.data.type==="wc-render"){try{window.Core.renderModule(e.data.code,document.getElementById("r"))}catch(err){}}});</script></body></html>`;

export function TemplateThumb({id}: {id: string}) {
	const hostRef = useRef<HTMLDivElement>(null);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [visible, setVisible] = useState(false);
	const [compiled, setCompiled] = useState("");
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const el = hostRef.current;
		if (!el) return;
		const io = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setVisible(true);
					io.disconnect();
				}
			},
			{rootMargin: "300px"},
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	useEffect(() => {
		if (visible)
			loadCompiled(id)
				.then(setCompiled)
				.catch(() => {});
	}, [visible, id]);

	useEffect(() => {
		if (ready && compiled) iframeRef.current?.contentWindow?.postMessage({type: "wc-render", code: compiled}, "*");
	}, [ready, compiled]);

	return (
		<div
			ref={hostRef}
			className="wwc:pointer-events-none wwc:relative wwc:h-[152px] wwc:w-full wwc:overflow-hidden wwc:bg-muted/20"
		>
			{visible && (
				<iframe
					ref={iframeRef}
					title={`${id} preview`}
					srcDoc={shell}
					onLoad={() => setReady(true)}
					sandbox="allow-scripts allow-same-origin"
					tabIndex={-1}
					style={{width: 1200, height: 760, transform: "scale(0.2)", transformOrigin: "top left", border: 0}}
				/>
			)}
		</div>
	);
}
