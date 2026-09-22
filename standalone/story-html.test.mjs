import assert from "node:assert/strict";
import test from "node:test";

import {buildStoryHtml, resolveStoryEntry} from "./story-html.mjs";

const representativeStories = [
	{
		storyId: "components-primitives-button--default",
		entry: {
			type: "story",
			title: "Components/Primitives/Button",
			name: "Default",
			importPath: "./apps/storybook/stories/primitives/Button.stories.tsx",
			exportName: "Default",
		},
	},
	{
		storyId: "widgets-data-datatable--default",
		entry: {
			type: "story",
			title: "Widgets/Data/DataTable",
			name: "Default",
			importPath: "./stories/layout/DataTable.stories.tsx",
			exportName: "Default",
		},
	},
	{
		storyId: "templates-appinstaller--default",
		entry: {
			type: "story",
			title: "Templates/AppInstaller",
			name: "Default",
			importPath: "./stories/templates/AppInstaller.stories.tsx",
			exportName: "Default",
		},
	},
];

test("resolveStoryEntry accepts stories and rejects docs", () => {
	const entries = {
		"button--default": {type: "story", importPath: "./stories/Button.stories.tsx", exportName: "Default"},
		"button--docs": {type: "docs", importPath: "./stories/Button.stories.tsx"},
	};

	assert.equal(resolveStoryEntry("button--default", entries), entries["button--default"]);
	assert.throws(() => resolveStoryEntry("button--docs", entries), /Only Storybook stories can be exported/);
	assert.throws(() => resolveStoryEntry("missing", entries), /Unknown Storybook story id/);
});

for (const representative of representativeStories) {
	test(`builds self-contained HTML for ${representative.storyId}`, {timeout: 30_000}, async () => {
		const html = await buildStoryHtml(representative);
		const documentShell = html.slice(0, html.indexOf('<script type="module">'));

		assert.ok(html.startsWith("<!doctype html>"), "starts with an HTML doctype");
		assert.ok(html.includes("<style>"), "inlines the compiled stylesheet");
		assert.ok(html.includes('<script type="module">'), "inlines the compiled module");
		assert.ok(html.includes('data-core-region="exported-story"'), "marks the exported Core region");
		assert.ok(!documentShell.includes('<script type="module" src='), "has no external entry script");
		assert.ok(!documentShell.includes('<link rel="stylesheet"'), "has no external stylesheet");
		assert.ok(!html.includes("fonts.googleapis.com"), "does not rely on Google Fonts");
	});
}
