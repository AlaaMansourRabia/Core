import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {ToolCall} from "@/components/ui/tool-call";

const longJson = `{"type":"image","source":{"type":"base64","data":"iVBORw0KGgoAAAANSUhEUgAAAr…
Y9TYx40rjf6T5kMfreJpDfMR6Mgrh1Y3JXIY2KpbQ4D34gfFmeBrkNCfRb9eBZFJxGZVJ…
7K2bQ1lMZHdnVGfUzMq3HWJN3LvKjVMOkXnjqJWE7sXNGCVK9GJa8fnB1RwhPL/8FkD…
+JhYzvKqGqSXKzjLQRm8jBzFdLO0wKrR/UbdPgWPK4uLQfYPpzD1c7y/Knx5xL/G9V…
ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890
…`;

export function ToolCallPage() {
	const [open, setOpen] = useState(false);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Tool Call</h1>
					<CopyButton
						value="Tool Call"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					Inline tool/function call widget for AI chats. Header (status, function name, args, chevron) and result
					summary line are always visible. The expanded body adds a scrollable output area. Pure composition over{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Card</code>,{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Collapsible</code>,{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ScrollArea</code>, and{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">lucide-react</code> icons.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Tool Call - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Click the row to expand. Closed by default.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-xl">
						<ToolCall
							name="Read"
							args="/var/folders/s0/j7r99kwj4b7gbxmdh3sx3ndh0000gn/T/casestudy-buddy-uplo…"
							summary="Read 1 line"
						>
							{longJson}
						</ToolCall>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Statuses</CardTitle>
						<CopyButton
							value="Tool Call - Statuses"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">status</code> drives the leading icon and
						tone: running (Loader2 spin), success (Check), error (CircleX), cancelled (CircleDashed).
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:max-w-xl wwc:flex-col wwc:gap-3">
						<ToolCall name="Bash" args="pnpm test" status="running" summary="Running… 2.4s elapsed" />
						<ToolCall name="Read" args="/path/to/file.txt" status="success" summary="Read 42 lines" />
						<ToolCall name="Bash" args="pnpm typecheck" status="error" summary="Exited 2 · 4.1s">
							{`error TS2322: Type 'string' is not assignable to type 'number'.\n  at src/foo.ts(12,3)`}
						</ToolCall>
						<ToolCall
							name="WebFetch"
							args="https://example.com/api/large-payload"
							status="cancelled"
							summary="Cancelled by user"
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Functions</CardTitle>
						<CopyButton
							value="Tool Call - Functions"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						The same shell works for any tool. Pick a name, set the args + summary, render whatever fits the output.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:max-w-xl wwc:flex-col wwc:gap-3">
						<ToolCall name="Read" args="/Users/jane/notes.md" summary="Read 18 lines">
							{`# Notes\n\n- Pick up groceries\n- Reply to Alex about the design review\n- Cancel the streaming subscription`}
						</ToolCall>
						<ToolCall name="Bash" args="git status --short" summary="Exited 0 · 0.2s">
							{` M packages/components/src/tool-call.tsx\n?? apps/storybook/stories/feedback/ToolCall.stories.tsx`}
						</ToolCall>
						<ToolCall name="Grep" args="useEffect" summary="Found 12 matches in 7 files">
							{`apps/web/src/pages/examples/TaskMonitorExamplePage.tsx:168\napps/web/src/pages/examples/TaskMonitorExamplePage.tsx:172\npackages/components/src/task-monitor.tsx:223\npackages/components/src/chat/core-ai-chat.tsx:101`}
						</ToolCall>
						<ToolCall name="WebSearch" args="latest TanStack Query release" summary="5 results">
							{`1. @tanstack/react-query v5.x — what's new\n2. Migrating from v4 to v5\n3. Suspense integration in v5\n4. Devtools 2025 update\n5. Optimistic updates patterns`}
						</ToolCall>
						<ToolCall name="Task" args="Audit a11y across the chip primitive" summary="Sub-agent finished · 14.6s">
							{`Audited Chip across all variants. Found 2 issues:\n1. Missing aria-pressed on filter variant when controlled\n2. Remove button lacks role="button" fallback when disabled`}
						</ToolCall>
						<ToolCall name="TodoWrite" summary="Updated 3 tasks" />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>In a chat thread</CardTitle>
						<CopyButton
							value="Tool Call - In a chat thread"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>How a tool call sits between assistant text turns.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:mx-auto wwc:flex wwc:max-w-xl wwc:flex-col wwc:gap-4">
						<div className="wwc:self-end wwc:rounded-2xl wwc:rounded-br-md wwc:bg-muted wwc:px-3 wwc:py-2 wwc:text-sm">
							What does this temp file contain?
						</div>
						<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:text-sm">
							<p>Let me check.</p>
							<ToolCall
								name="Read"
								args="/var/folders/s0/j7r99kwj4b7gbxmdh3sx3ndh0000gn/T/casestudy-buddy-uplo…"
								summary="Read 1 line"
								defaultOpen
							>
								{longJson}
							</ToolCall>
							<p>It's a base64-encoded PNG — the case-study buddy upload payload.</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Controlled</CardTitle>
						<CopyButton
							value="Tool Call - Controlled"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pass <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">open</code> +{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">onOpenChange</code> to drive expand state
						from the outside.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:max-w-xl wwc:flex-col wwc:gap-3">
						<Button variant="outline" size="sm" className="wwc:self-start" onClick={() => setOpen((o) => !o)}>
							Toggle (open={String(open)})
						</Button>
						<ToolCall name="Read" args="/path/to/file.txt" summary="Read 18 lines" open={open} onOpenChange={setOpen}>
							{longJson}
						</ToolCall>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Tool Call - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{prop: "name", type: "string", def: "—", desc: "Function/tool name shown in the header."},
									{prop: "args", type: "string", def: "—", desc: "Compact single-line arg preview, truncated."},
									{
										prop: "status",
										type: '"running" | "success" | "error" | "cancelled"',
										def: '"success"',
										desc: "Drives the leading status icon and color.",
									},
									{
										prop: "summary",
										type: "ReactNode",
										def: "—",
										desc: "Always-visible result line below the header (e.g. 'Read 1 line').",
									},
									{prop: "children", type: "ReactNode", def: "—", desc: "Output rendered when the row is expanded."},
									{prop: "defaultOpen", type: "boolean", def: "false", desc: "Initial open state (uncontrolled)."},
									{prop: "open", type: "boolean", def: "—", desc: "Controlled open state."},
									{
										prop: "onOpenChange",
										type: "(open: boolean) => void",
										def: "—",
										desc: "Open-state change callback.",
									},
									{
										prop: "outputMaxHeight",
										type: "number | string",
										def: "320",
										desc: "Caps the output ScrollArea height.",
									},
									{prop: "icon", type: "ReactNode", def: "—", desc: "Override the default status icon."},
								].map((row) => (
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
		</div>
	);
}
