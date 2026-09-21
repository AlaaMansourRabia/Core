import {useState} from "react";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CommentComposer} from "@/components/ui/comment-composer";
import {CopyButton} from "@/components/ui/copy-button";

const props: {prop: string; type: string; def: string; desc: string}[] = [
	{prop: "value", type: "string", def: "undefined", desc: "Controlled textarea value. Pair with onChange."},
	{prop: "defaultValue", type: "string", def: '""', desc: "Uncontrolled initial value."},
	{prop: "onChange", type: "(value: string) => void", def: "undefined", desc: "Fires on every keystroke."},
	{
		prop: "onSubmit",
		type: "(value: string) => void",
		def: "undefined",
		desc: "Fires when the submit button is clicked or the user presses Cmd/Ctrl+Enter.",
	},
	{
		prop: "onToolbarAction",
		type: "(action: CommentToolbarAction) => void",
		def: "undefined",
		desc: "Fires when a toolbar formatting button is clicked. The composer does not apply formatting itself — wire this to your editor.",
	},
	{prop: "placeholder", type: "string", def: '"Add comment"', desc: "Placeholder text in the textarea."},
	{prop: "submitLabel", type: "string", def: '"Comment"', desc: "Label on the submit button."},
	{prop: "rows", type: "number", def: "3", desc: "Initial textarea row count."},
	{
		prop: "toolbarActions",
		type: "CommentToolbarAction[]",
		def: "all 13 actions",
		desc: "Restrict the toolbar to a subset (also reorders).",
	},
	{prop: "disabled", type: "boolean", def: "false", desc: "Disables both the textarea and toolbar."},
	{prop: "isSubmitting", type: "boolean", def: "false", desc: "Submit button shows the loading state and is disabled."},
];

export function CommentComposerPage() {
	const [submitted, setSubmitted] = useState<string[]>([]);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Comment Composer</h1>
					<CopyButton
						value="Comment Composer"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					Bordered text input with a formatting toolbar (inline format, alignment, lists, quote / code, image) and a
					submit button. Fully presentational — the toolbar fires <code>onToolbarAction</code> callbacks; wire it to
					your editor of choice. Submits on click or Cmd/Ctrl+Enter.
				</p>
			</div>

			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Default</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Empty state matching the screenshot. Toolbar buttons are visible but the submit is disabled until there's
					content.
				</p>
				<div className="wwc:max-w-3xl">
					<CommentComposer onSubmit={(v) => setSubmitted((prev) => [...prev, v])} />
				</div>
				{submitted.length > 0 && (
					<div className="wwc:mt-4 wwc:max-w-3xl wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/40 wwc:p-3">
						<div className="wwc:mb-2 wwc:text-xs wwc:font-semibold wwc:text-muted-foreground">Submitted</div>
						<ul className="wwc:space-y-1 wwc:text-sm">
							{submitted.map((s, i) => (
								<li key={i} className="wwc:rounded wwc:bg-background wwc:px-2 wwc:py-1">
									{s}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Custom toolbar</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Pass <code>toolbarActions</code> to restrict the toolbar to a subset. Group separators are inserted
					automatically.
				</p>
				<div className="wwc:max-w-3xl">
					<CommentComposer
						toolbarActions={["bold", "italic", "list-bulleted", "list-numbered", "code"]}
						placeholder="Reply to this comment..."
						submitLabel="Reply"
					/>
				</div>
			</div>

			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Custom labels</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Override <code>placeholder</code> and <code>submitLabel</code> to scope the composer to a specific surface.
				</p>
				<div className="wwc:max-w-3xl">
					<CommentComposer placeholder="Leave a review..." submitLabel="Post review" />
				</div>
			</div>

			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Submitting state</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Set <code>isSubmitting</code> while the parent is awaiting the network round-trip.
				</p>
				<div className="wwc:max-w-3xl">
					<CommentComposer defaultValue="This is in flight..." isSubmitting />
				</div>
			</div>

			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Disabled</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">Read-only thread? Disable the whole composer.</p>
				<div className="wwc:max-w-3xl">
					<CommentComposer disabled placeholder="Comments are closed" />
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Props</CardTitle>
						<CopyButton
							value="Comment Composer - Props"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-sm">
							<thead>
								<tr className="wwc:border-b wwc:border-border wwc:text-left">
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Prop</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Type</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Default</th>
									<th className="wwc:py-2 wwc:font-semibold">Description</th>
								</tr>
							</thead>
							<tbody>
								{props.map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Comment Composer - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { CommentComposer } from "@/components/ui/comment-composer";

<CommentComposer
  onSubmit={(value) => postComment(value)}
  onToolbarAction={(action) => applyFormatting(action)}
/>

{/* Restrict toolbar */}
<CommentComposer
  toolbarActions={["bold", "italic", "list-bulleted", "code"]}
  placeholder="Reply..."
  submitLabel="Reply"
/>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
