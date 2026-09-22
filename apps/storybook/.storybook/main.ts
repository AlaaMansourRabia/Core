import type {StorybookConfig} from "storybook/internal/types";

import tailwindcss from "@tailwindcss/vite";

import {coreHtmlExportPlugin} from "./html-export-plugin.mjs";

const config: StorybookConfig = {
	stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(ts|tsx)"],
	addons: [
		"@storybook/addon-a11y",
		"@storybook/addon-docs",
		"@storybook/addon-vitest",
		"@chromatic-com/storybook",
		"@storybook/addon-mcp",
	],
	framework: "@storybook/react-vite",
	staticDirs: ["../public", "../../../prototypes/capture/public"],
	// Served at "/" locally; the hosted hub builds it under a subpath (SB_BASE=/storybook/) so it can be
	// embedded same-origin at core.core.com/storybook/.
	managerHead: (head) => (process.env.SB_BASE ? `${head}\n<base href="${process.env.SB_BASE}">` : head),
	viteFinal: async (config) => {
		config.plugins = config.plugins || [];
		config.plugins.push(tailwindcss());
		config.plugins.push(coreHtmlExportPlugin());
		if (process.env.SB_BASE) config.base = process.env.SB_BASE;

		// Use source files for workspace packages during development
		config.resolve = config.resolve || {};
		config.resolve.conditions = ["source", ...(config.resolve.conditions || [])];

		return config;
	},
};

export default config;
