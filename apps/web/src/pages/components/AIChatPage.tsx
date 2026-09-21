import {
	AlertTriangle,
	Bookmark,
	Calendar,
	Clock,
	Download,
	FileSpreadsheet,
	FileText,
	Gauge,
	Plus,
	Settings,
	Share2,
	Sparkles,
	Trash2,
} from "lucide-react";
import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {AIChat} from "@/components/ui/chat/core-ai-chat";
import {CopyButton} from "@/components/ui/copy-button";
import type {PromptContextItem} from "@/components/ui/prompt-input";

/** Anthropic brand mark (8-pointed asterisk-style glyph). */
function Anthropic({className}: {className?: string}) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			className={className}
			aria-hidden="true"
		>
			<path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
		</svg>
	);
}

const projectContext: PromptContextItem[] = [
	{
		id: "ctx-progress-report",
		label: "Weekly progress report",
		description: "Last updated 2 days ago",
		icon: <FileText className="wwc:h-3.5 wwc:w-3.5" />,
	},
	{
		id: "ctx-schedule",
		label: "Project schedule",
		description: "Gantt — 124 tasks",
		icon: <Calendar className="wwc:h-3.5 wwc:w-3.5" />,
	},
	{
		id: "ctx-cost-budget",
		label: "Cost budget Q3",
		description: "Excel spreadsheet",
		icon: <FileSpreadsheet className="wwc:h-3.5 wwc:w-3.5" />,
	},
	{
		id: "ctx-quality",
		label: "Quality issues log",
		description: "23 open issues",
		icon: <FileText className="wwc:h-3.5 wwc:w-3.5" />,
	},
];

export function AIChatPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">AI Chat</h1>
					<CopyButton
						value="AI Chat"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					An inline AI chat container. User messages render as small grey rounded pills aligned to the right; AI
					responses render as full-width plain text without bubbles, timestamps, or sender names. Designed to be
					embedded directly in a page rather than popped out of a corner button. Full bleed by default (fills its parent
					edge-to-edge) — pass <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">contained</code> to wrap
					it in a rounded, bordered card.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="AI Chat - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Embedded AI chat with Add context, Upload file, and suggested prompts. Try clicking a suggestion, attaching
						context, or typing your own message.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[600px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
						<AIChat availableContext={projectContext} onUploadFile={(files) => console.log("upload", files)} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Toolbar (default)</CardTitle>
						<CopyButton
							value="AI Chat - With Toolbar"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						New default toolbar variant. Left: a pane toggle wired to a sibling panel. Middle: context usage line and a
						background-process status (spinner + label). Right: up to 4 icon actions plus a hamburger that catches
						overflow when more are passed.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[600px]">
						<AIChatWithToolbar />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Header</CardTitle>
						<CopyButton
							value="AI Chat - With Header"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Header with a model dropdown and an effort/mode dropdown on the left, and a set of icon-button actions (New
						chat, History, Delete) on the right. The header only renders when at least one header-related prop is
						provided.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[600px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
						<AIChatWithHeader />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Custom Prompts & Empty State</CardTitle>
						<CopyButton
							value="AI Chat - Custom Prompts & Empty State"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Override emptyTitle, emptySubtitle, and suggestedPrompts for domain-specific contexts.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[600px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
						<AIChat
							emptyTitle="What can I help you with on this report?"
							emptySubtitle="Ask about workforce, schedule, costs, or quality."
							placeholder="Ask about this report..."
							suggestedPrompts={[
								"Summarize today's progress",
								"Where are we behind schedule?",
								"Show top 3 risks",
								"Compare this week to last week",
							]}
							availableContext={projectContext}
							onUploadFile={(files) => console.log("upload", files)}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Component composition</CardTitle>
						<CopyButton
							value="AI Chat - Component composition"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>How AIChat differs from ChatWidget.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Aspect</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">ChatWidget</th>
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">AIChat</th>
								</tr>
							</thead>
							<tbody>
								{[
									{a: "Trigger", w: "Floating gradient button bottom-right", n: "Inline container — no trigger"},
									{
										a: "User message",
										w: "Primary-color bubble, right-aligned with rounded-br-md",
										n: "Grey muted pill, right-aligned, fully rounded",
									},
									{
										a: "AI message",
										w: "Muted bubble, left-aligned with rounded-bl-md",
										n: "Full-width plain text, no bubble",
									},
									{a: "Sender name", w: "Optional userName above user message", n: "None"},
									{a: "Timestamp", w: "Shown below each message", n: "None"},
									{a: "Header chrome", w: "Title + minimize + close buttons", n: "None — fits inside any container"},
									{a: "Underlying service", w: "sendChatMessage from chatService", n: "Same — same API endpoint"},
								].map((row) => (
									<tr key={row.a} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-medium wwc:whitespace-nowrap">{row.a}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:text-muted-foreground">{row.w}</td>
										<td className="wwc:py-3 wwc:text-foreground">{row.n}</td>
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
							value="AI Chat - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { AIChat } from "@/components/ui/chat/core-ai-chat";

// Drop it into any container with a constrained height
<div className="h-[600px]">
  <AIChat
    emptyTitle="What can I help you with?"
    emptySubtitle="Ask about your data."
    placeholder="Ask anything..."
    suggestedPrompts={[
      "Summarize this report",
      "Show me trends",
    ]}
  />
</div>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}

const MODELS = [
	{
		id: "opus-4.7",
		label: "Opus 4.7",
		icon: <Anthropic className="wwc:h-3.5 wwc:w-3.5" />,
		description: "Most capable, slower",
	},
	{
		id: "sonnet-4.6",
		label: "Sonnet 4.6",
		icon: <Anthropic className="wwc:h-3.5 wwc:w-3.5" />,
		description: "Balanced",
	},
	{
		id: "haiku-4.5",
		label: "Haiku 4.5",
		icon: <Anthropic className="wwc:h-3.5 wwc:w-3.5" />,
		description: "Fastest",
	},
];

const MODES = [
	{id: "high", label: "High", icon: <Gauge className="wwc:h-3.5 wwc:w-3.5" />, description: "Deeper reasoning"},
	{id: "medium", label: "Medium", icon: <Gauge className="wwc:h-3.5 wwc:w-3.5" />, description: "Balanced effort"},
	{id: "low", label: "Low", icon: <Gauge className="wwc:h-3.5 wwc:w-3.5" />, description: "Fastest response"},
];

function AIChatWithToolbar() {
	const [panelOpen, setPanelOpen] = useState(true);
	const [resetKey, setResetKey] = useState(0);

	return (
		<div className="wwc:flex wwc:h-full wwc:gap-3">
			{panelOpen && (
				<div className="wwc:flex wwc:h-full wwc:w-56 wwc:flex-col wwc:gap-2 wwc:rounded-xl wwc:border wwc:bg-muted/30 wwc:p-3">
					<div className="wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
						Conversations
					</div>
					<div className="wwc:flex wwc:flex-col wwc:gap-1">
						{["Schedule review", "Cost variance Q3", "Quality issues triage", "Workforce roll-up"].map((title) => (
							<button
								key={title}
								type="button"
								className="wwc:rounded-md wwc:px-2 wwc:py-1.5 wwc:text-left wwc:text-xs wwc:text-foreground wwc:transition-colors wwc:hover:bg-accent"
							>
								{title}
							</button>
						))}
					</div>
				</div>
			)}
			<div className="wwc:flex wwc:h-full wwc:min-w-0 wwc:flex-1">
				<AIChat
					key={resetKey}
					contained
					availableContext={projectContext}
					onUploadFile={(files) => console.log("upload", files)}
					onTogglePane={() => setPanelOpen((p) => !p)}
					paneOpen={panelOpen}
					headerContext={{
						usage: "Context used: 0.2%",
						status: "Indexing 4 slides...",
					}}
					headerActions={[
						{id: "boost", label: "Quick replies", icon: <Sparkles />, onSelect: () => console.log("boost")},
						{
							id: "alert",
							label: "View context warnings",
							icon: <AlertTriangle />,
							onSelect: () => console.log("alert"),
						},
					]}
					headerMenuActions={[
						{id: "share", label: "Share conversation", icon: <Share2 />, onSelect: () => console.log("share")},
						{id: "export", label: "Export transcript", icon: <Download />, onSelect: () => console.log("export")},
						{id: "save", label: "Save as template", icon: <Bookmark />, onSelect: () => console.log("save")},
						{
							id: "settings",
							label: "Conversation settings",
							icon: <Settings />,
							onSelect: () => console.log("settings"),
						},
						{
							id: "delete",
							label: "Delete conversation",
							icon: <Trash2 />,
							tone: "destructive",
							onSelect: () => setResetKey((k) => k + 1),
						},
					]}
				/>
			</div>
		</div>
	);
}

function AIChatWithHeader() {
	const [modelId, setModelId] = useState("opus-4.7");
	const [modeId, setModeId] = useState("high");
	const [resetKey, setResetKey] = useState(0);

	return (
		<AIChat
			key={resetKey}
			availableContext={projectContext}
			onUploadFile={(files) => console.log("upload", files)}
			headerVariant="header"
			models={MODELS}
			selectedModelId={modelId}
			onSelectModel={setModelId}
			modes={MODES}
			selectedModeId={modeId}
			onSelectMode={setModeId}
			headerActions={[
				{
					id: "new",
					label: "New chat",
					icon: <Plus />,
					onSelect: () => setResetKey((k) => k + 1),
				},
				{
					id: "history",
					label: "Chat history",
					icon: <Clock />,
					onSelect: () => console.log("show history"),
				},
			]}
			headerMenuActions={[
				{
					id: "delete",
					label: "Delete chat",
					icon: <Trash2 />,
					tone: "destructive",
					onSelect: () => setResetKey((k) => k + 1),
				},
			]}
		/>
	);
}
