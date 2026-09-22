import {createElement} from "react";
import {addons, types} from "storybook/manager-api";

import {coreLight} from "./core-theme";
import {HtmlExportTool} from "./html-export/HtmlExportTool";
import {RootLabelWithCount} from "./sidebar/RootItemCount";
import "./manager.css";

// Keep storybook manager UI always in light mode
// Dark mode toggle only affects the story preview (runs in separate iframe)
addons.setConfig({
	theme: coreLight,
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

// One export action for every canvas story. The selected story is composed with its real Core
// implementation and bundled by the local Storybook server into a single offline HTML download.
addons.register("core/clickable-html", () => {
	addons.add("core/clickable-html/export", {
		title: "Export clickable HTML",
		type: types.TOOL,
		match: ({viewMode}) => viewMode === "story",
		render: () => createElement(HtmlExportTool),
	});
});
