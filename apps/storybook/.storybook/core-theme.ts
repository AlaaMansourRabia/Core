import {create} from "storybook/theming";

export const coreLight = create({
	base: "light",
	brandTitle: "Core",
	brandUrl: "https://core.com",
	brandTarget: "_self",

	// Typography
	fontBase: '"Figtree", ui-sans-serif, sans-serif, system-ui',
	fontCode: '"IBM Plex Mono", ui-monospace, monospace',

	// Brand
	colorPrimary: "#1c1917",
	colorSecondary: "#57534e",

	// UI
	appBg: "#ffffff",
	appContentBg: "#ffffff",
	appBorderColor: "#e7e5e4",
	appBorderRadius: 8,
	appPreviewBg: "#ffffff",

	// Toolbar
	barBg: "#ffffff",
	barTextColor: "#78716c",
	barSelectedColor: "#1c1917",
	barHoverColor: "#44403c",

	// Text
	textColor: "#1c1917",
	textInverseColor: "#fafaf9",
	textMutedColor: "#a8a29e",

	// Form
	inputBg: "#ffffff",
	inputBorder: "#e7e5e4",
	inputTextColor: "#1c1917",
	inputBorderRadius: 6,

	// Boolean
	booleanBg: "#e7e5e4",
	booleanSelectedBg: "#1c1917",
});

export const coreDark = create({
	base: "dark",
	brandTitle: "Core",
	brandUrl: "https://core.com",
	brandTarget: "_self",

	fontBase: '"Figtree", ui-sans-serif, sans-serif, system-ui',
	fontCode: '"IBM Plex Mono", ui-monospace, monospace',

	colorPrimary: "#fafaf9",
	colorSecondary: "#d6d3d1",

	appBg: "#0c0a09",
	appContentBg: "#1c1917",
	appBorderColor: "#292524",
	appBorderRadius: 8,
	appPreviewBg: "#1c1917",

	barBg: "#1c1917",
	barTextColor: "#a8a29e",
	barSelectedColor: "#fafaf9",
	barHoverColor: "#d6d3d1",

	textColor: "#fafaf9",
	textInverseColor: "#0c0a09",
	textMutedColor: "#78716c",

	inputBg: "#1c1917",
	inputBorder: "#292524",
	inputTextColor: "#fafaf9",
	inputBorderRadius: 6,

	booleanBg: "#292524",
	booleanSelectedBg: "#fafaf9",
});
