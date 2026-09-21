import type {Preview} from "storybook/internal/types";

import {AutodocsPage} from "../stories/_docs/ComponentKnowledge";
import "./preview.css";

const preview: Preview = {
	globalTypes: {
		theme: {
			description: "Toggle between light and dark mode",
			toolbar: {
				title: "Theme",
				icon: "moon",
				items: [
					{value: "light", icon: "sun", title: "Light"},
					{value: "dark", icon: "moon", title: "Dark"},
				],
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: {
		theme: "light",
	},
	decorators: [
		(Story, context) => {
			const theme = context.globals.theme || "light";
			const isDark = theme === "dark";

			// Apply .dark class to the preview iframe's html element
			// This is safe because the preview runs in its own iframe,
			// separate from the storybook manager UI (sidebar/toolbar)
			document.documentElement.classList.toggle("dark", isDark);
			document.documentElement.style.colorScheme = isDark ? "dark" : "light";
			// Deliberately NOT setting body background/color here. Inline styles outrank every
			// stylesheet rule, so hardcoding light values froze the page's inherited text colour:
			// components that toggle `.dark` themselves (the sidebar's theme switch) flipped the
			// class but could never flip the colour, leaving near-black text on a dark surface.
			// preview.css binds body to the tokens instead, so both toggles agree.
			document.body.style.removeProperty("background-color");
			document.body.style.removeProperty("color");

			// Also apply to storybook-root for components that check closest ancestor
			const root = document.getElementById("storybook-root");
			if (root) {
				root.classList.toggle("dark", isDark);
			}

			return Story();
		},
	],
	parameters: {
		docs: {
			// Every component's autodocs page renders the shared catalog-knowledge block (from
			// library-index.json) near the top, between the description and the first example.
			// MDX docs pages define their own content and are unaffected. See stories/_docs/ComponentKnowledge.tsx.
			page: AutodocsPage,
		},
		options: {
			storySort: {
				// Top-level IA reflects what WakeCore is becoming: a knowledge platform, not just a
				// component library. Component categories nest under "Components/"; Widgets, Templates,
				// Knowledge, Evaluation, and Visual Proof are first-class sections (placeholders today).
				// See docs/STORYBOOK-IA.md.
				order: [
					"Getting Started",
					["Welcome", "Overview", "Dark Mode", "AI Agents", "Contributing", "CI-CD"],
					// Tokens are the first material in the pipeline the Welcome page describes
					// (Tokens → Components → Widgets → Templates), so they sit as their own top-level
					// section ahead of Components rather than buried inside Getting Started.
					"Design Tokens",
					["Overview", "Colors", "Font Family", "Radius", "Spacing"],
					"Components",
					[
						"Overview",
						"Primitives",
						"Forms",
						"Navigation",
						"Overlay",
						"Layout",
						"Data Display",
						"Charts",
						"Feedback",
						"Map",
						"Drawing Canvas",
					],
					"Widgets",
					["Overview", "Data", "Navigation", "Map", "Schedule", "Activity", "Comments", "Chat", "Setup", "Canvas"],
					"Templates",
					"Knowledge",
					"Evaluation",
					"Visual Proof",
					"*",
				],
			},
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /date$/i,
			},
		},
	},
};

export default preview;
