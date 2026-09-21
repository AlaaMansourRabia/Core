import {createElement} from "react";
import {createRoot} from "react-dom/client";
import {addons, types} from "storybook/manager-api";

import {ChatDock} from "./chat/ChatDock";
import {HtmlExportTool} from "./html-export/HtmlExportTool";
import {RootLabelWithCount} from "./sidebar/RootItemCount";
import {wakecapLight} from "./wakecap-theme";
import "./manager.css";

// Keep storybook manager UI always in light mode
// Dark mode toggle only affects the story preview (runs in separate iframe)
addons.setConfig({
	theme: wakecapLight,
	sidebar: {
		showRoots: true,
		// Section headers carry how many pages sit inside them; everything else keeps its plain name.
		renderLabel: (item) => (item.type === "root" ? createElement(RootLabelWithCount, {item}) : item.name),
		collapsedRoots: [
			"primitives",
			"layout",
			"overlay",
			"navigation",
			"form",
			"feedback",
			"display",
			"charts",
			"map",
			"theme",
		],
	},
});

// Floating "ask about this component" chat dock (bottom-right). Talks to the local Claude CLI
// bridge (apps/storybook/chat-bridge). Mounted once into the manager DOM so it survives story
// changes; the dock itself resets its conversation whenever the current story changes.
addons.register("wakecore/chat-dock", (api) => {
	const mount = document.createElement("div");
	mount.id = "wc-chat-dock-root";
	document.body.appendChild(mount);
	createRoot(mount).render(createElement(ChatDock, {api}));
});

// One export action for every canvas story. The selected story is composed with its real WakeCore
// implementation and bundled by the local Storybook server into a single offline HTML download.
addons.register("wakecore/clickable-html", () => {
	addons.add("wakecore/clickable-html/export", {
		title: "Export clickable HTML",
		type: types.TOOL,
		match: ({viewMode}) => viewMode === "story",
		render: () => createElement(HtmlExportTool),
	});
});
