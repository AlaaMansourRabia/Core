// Tailwind CSS 3 preset for Wakecore design tokens.
//
// Maps all semantic CSS custom properties from @wakecap/core-tokens
// into Tailwind 3's theme so consumers can use standard unprefixed
// utility classes (e.g. text-muted-foreground, bg-primary)
// that resolve to the same design tokens used by @wakecap/core-ui.
//
// Usage:
//   const wakecorePreset = require("@wakecap/core-tokens/tailwind3-preset");
//   module.exports = { presets: [wakecorePreset], ... };

/** @type {import('tailwindcss').Config} */
module.exports = {
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				card: {
					DEFAULT: "var(--card)",
					foreground: "var(--card-foreground)",
				},
				popover: {
					DEFAULT: "var(--popover)",
					foreground: "var(--popover-foreground)",
				},
				primary: {
					DEFAULT: "var(--primary)",
					foreground: "var(--primary-foreground)",
				},
				secondary: {
					DEFAULT: "var(--secondary)",
					foreground: "var(--secondary-foreground)",
				},
				muted: {
					DEFAULT: "var(--muted)",
					foreground: "var(--muted-foreground)",
				},
				accent: {
					DEFAULT: "var(--accent)",
					foreground: "var(--accent-foreground)",
				},
				"menu-highlight": {
					DEFAULT: "var(--menu-highlight)",
					foreground: "var(--menu-highlight-foreground)",
				},
				destructive: {
					DEFAULT: "var(--destructive)",
					foreground: "var(--destructive-foreground)",
				},
				success: "var(--success)",
				warning: "var(--warning)",
				border: "var(--border)",
				input: "var(--input)",
				ring: "var(--ring)",
				chart: {
					1: "var(--chart-1)",
					2: "var(--chart-2)",
					3: "var(--chart-3)",
					4: "var(--chart-4)",
					5: "var(--chart-5)",
				},
				sidebar: {
					DEFAULT: "var(--sidebar)",
					foreground: "var(--sidebar-foreground)",
					primary: "var(--sidebar-primary)",
					"primary-foreground": "var(--sidebar-primary-foreground)",
					accent: "var(--sidebar-accent)",
					"accent-foreground": "var(--sidebar-accent-foreground)",
					border: "var(--sidebar-border)",
					ring: "var(--sidebar-ring)",
				},
			},
			// Collapsed to a single flat corner — see the radius note in theme.css.
			borderRadius: {
				DEFAULT: "var(--radius)",
				sm: "var(--radius)",
				md: "var(--radius)",
				lg: "var(--radius)",
				xl: "var(--radius)",
				"2xl": "var(--radius)",
				"3xl": "var(--radius)",
			},
			fontFamily: {
				sans: ["Figtree", "ui-sans-serif", "sans-serif", "system-ui"],
				serif: ["Lora", "ui-serif", "serif"],
				mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
			},
		},
	},
};
