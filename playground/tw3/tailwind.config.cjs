const wakecorePreset = require("@wakecap/core-tokens/tailwind3-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
	presets: [wakecorePreset],
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [],
};
