import {DownloadIcon} from "@storybook/icons";
import * as React from "react";
import {Button} from "storybook/internal/components";
import {useGlobals, useStorybookState} from "storybook/manager-api";

type StoryIndexEntry = {
	id: string;
	name: string;
	title: string;
	type: "story" | "docs";
	importPath?: string;
	exportName?: string;
};

type StoryIndex = {
	entries: Record<string, StoryIndexEntry>;
};

// The export endpoint is Vite dev-server middleware (see ../html-export-plugin.mjs): each click
// runs a real Vite build over the story source. A built Storybook is static files — on
// core.wakecap.com the POST hits Vercel's static host and comes back 405, which used to surface as
// a bare "The clickable HTML export failed." Storybook stamps CONFIG_TYPE on the window at build
// time, so we can tell the two apart up front and say what is actually going on.
const IS_STATIC_BUILD = (globalThis as {CONFIG_TYPE?: string}).CONFIG_TYPE !== "DEVELOPMENT";
const LOCAL_ONLY_HINT =
	"Clickable HTML export runs only in local Storybook (pnpm storybook) — it builds the story on the dev server, which the hosted static build has no way to do.";

function downloadName(response: Response, entry: StoryIndexEntry) {
	const disposition = response.headers.get("content-disposition");
	const match = disposition?.match(/filename="([^"]+)"/);
	return match?.[1] ?? `${entry.id}.html`;
}

export function HtmlExportTool() {
	const {storyId} = useStorybookState();
	const [globals] = useGlobals();
	const [status, setStatus] = React.useState<"idle" | "exporting" | "done" | "error">("idle");
	const [message, setMessage] = React.useState(
		IS_STATIC_BUILD ? LOCAL_ONLY_HINT : "Export this story as one clickable HTML file",
	);

	async function exportHtml() {
		if (!storyId || status === "exporting") return;
		if (IS_STATIC_BUILD) {
			setStatus("error");
			setMessage(LOCAL_ONLY_HINT);
			return;
		}
		setStatus("exporting");
		setMessage("Building clickable HTML…");

		try {
			const indexResponse = await fetch(new URL("index.json", document.baseURI));
			if (!indexResponse.ok) throw new Error("Storybook index is unavailable.");
			const index = (await indexResponse.json()) as StoryIndex;
			const entry = index.entries[storyId];
			if (!entry || entry.type !== "story") throw new Error("Select a story before exporting HTML.");

			const response = await fetch(new URL("__wakecore/export-html", document.baseURI), {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({storyId, entry, theme: globals.theme === "dark" ? "dark" : "light"}),
			});

			if (!response.ok) {
				// 404/405 means there is no dev-server middleware answering — a static host, or the
				// dev server died. Anything else is a real build failure and carries its own reason.
				if (response.status === 404 || response.status === 405) throw new Error(LOCAL_ONLY_HINT);
				const detail = (await response.json().catch(() => null)) as {error?: string} | null;
				throw new Error(detail?.error ?? "The clickable HTML export failed.");
			}

			const url = URL.createObjectURL(await response.blob());
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = downloadName(response, entry);
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			URL.revokeObjectURL(url);
			setStatus("done");
			setMessage("Clickable HTML downloaded");
			window.setTimeout(() => {
				setStatus("idle");
				setMessage("Export this story as one clickable HTML file");
			}, 2500);
		} catch (error) {
			setStatus("error");
			setMessage(error instanceof Error ? error.message : "The clickable HTML export failed.");
		}
	}

	return (
		<Button
			ariaLabel={message}
			ariaDescription="Downloads the selected WakeCore template, widget, or component story as a self-contained offline HTML file."
			variant={status === "error" ? "outline" : "ghost"}
			padding="small"
			size="small"
			disabled={!storyId || status === "exporting" || IS_STATIC_BUILD}
			title={message}
			onClick={exportHtml}
		>
			<DownloadIcon />
			{status === "exporting"
				? "Exporting…"
				: status === "done"
					? "Downloaded"
					: IS_STATIC_BUILD
						? "Export HTML (local only)"
						: "Export HTML"}
		</Button>
	);
}
