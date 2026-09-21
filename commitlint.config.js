module.exports = {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"subject-case": [1, "always", ["lower-case"]],
	},
	ignores: [(message) => message.startsWith("agnc-")],
};
