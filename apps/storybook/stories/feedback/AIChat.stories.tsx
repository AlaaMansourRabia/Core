import type {Message} from "@corensystem/coren-ui/types/chat";
import type {Meta, StoryObj} from "storybook/internal/types";

import {AIChat} from "@corensystem/coren-ui/chat/core-ai-chat";
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

const projectContext = [
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

const meta = {
	title: "Widgets/Chat/AI Chat",
	component: AIChat,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Inline AI chat container with grey user pills and full-width assistant responses (no bubble, no timestamps, no avatars). Designed to be embedded directly in a page. Composes `PromptInput`, `ScrollArea`, and the chat service.",
			},
		},
	},
} satisfies Meta<typeof AIChat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-[600px] wwc:w-[640px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
			<AIChat />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Empty state with default suggested prompts. Click a suggestion or type your own message.",
			},
		},
	},
};

export const Contained: Story = {
	render: () => (
		<div className="wwc:h-[600px] wwc:w-[640px]">
			<AIChat contained />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"`contained` wraps the chat in its own rounded, bordered card. The default (omit the prop) is full bleed — the chat fills its parent edge-to-edge so the implementer can supply the frame.",
			},
		},
	},
};

export const WithToolbar: Story = {
	render: () => {
		function Demo() {
			const [panelOpen, setPanelOpen] = useState(true);
			const [resetKey, setResetKey] = useState(0);
			return (
				<div className="wwc:flex wwc:h-[600px] wwc:w-[820px] wwc:gap-3">
					{panelOpen && (
						<div className="wwc:flex wwc:h-full wwc:w-56 wwc:flex-col wwc:gap-2 wwc:rounded-xl wwc:border wwc:bg-muted/30 wwc:p-3">
							<div className="wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
								Conversations
							</div>
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
					)}
					<div className="wwc:flex wwc:h-full wwc:min-w-0 wwc:flex-1">
						<AIChat
							key={resetKey}
							contained
							availableContext={projectContext}
							onTogglePane={() => setPanelOpen((p) => !p)}
							paneOpen={panelOpen}
							headerContext={{usage: "Context used: 0.2%", status: "Indexing 4 slides..."}}
							headerActions={[
								{id: "boost", label: "Quick replies", icon: <Sparkles />, onSelect: () => undefined},
								{id: "alert", label: "View context warnings", icon: <AlertTriangle />, onSelect: () => undefined},
							]}
							headerMenuActions={[
								{id: "share", label: "Share conversation", icon: <Share2 />, onSelect: () => undefined},
								{id: "export", label: "Export transcript", icon: <Download />, onSelect: () => undefined},
								{id: "save", label: "Save as template", icon: <Bookmark />, onSelect: () => undefined},
								{id: "settings", label: "Conversation settings", icon: <Settings />, onSelect: () => undefined},
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
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Default toolbar variant. Left toggles a sibling pane, middle shows context usage + background-process status, right shows up to 4 actions with a hamburger overflow.",
			},
		},
	},
};

export const WithContextAndUpload: Story = {
	render: () => (
		<div className="wwc:h-[600px] wwc:w-[640px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
			<AIChat availableContext={projectContext} onUploadFile={(files) => console.log("upload", files)} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"With Add context popover and Upload file enabled. Selected context appears as a chip above the textarea.",
			},
		},
	},
};

export const CustomEmptyState: Story = {
	render: () => (
		<div className="wwc:h-[600px] wwc:w-[640px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
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
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Override `emptyTitle`, `emptySubtitle`, `placeholder`, and `suggestedPrompts` to scope the chat to a specific domain.",
			},
		},
	},
};

export const NoSuggestions: Story = {
	render: () => (
		<div className="wwc:h-[600px] wwc:w-[640px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
			<AIChat suggestedPrompts={[]} />
		</div>
	),
	parameters: {
		docs: {description: {story: "Empty state with the suggestion chips hidden."}},
	},
};

export const PreSeededConversation: Story = {
	render: () => (
		<div className="wwc:h-[600px] wwc:w-[640px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
			<AIChat
				initialMessages={[
					{
						id: "m1",
						role: "user",
						type: "text",
						content: "What does 'calibrate' mean in this context?",
						timestamp: new Date(),
					},
					{
						id: "m2",
						role: "assistant",
						type: "text",
						content:
							"In this report, calibrate refers to fine-tuning the sensor thresholds to match the site's measured baseline. Adjust each sensor's offset until the readings align with the field-verified values.",
						timestamp: new Date(),
					},
					{
						id: "m3",
						role: "user",
						type: "text",
						content: "Other words similar to calibrate",
						timestamp: new Date(),
					},
					{
						id: "m4",
						role: "assistant",
						type: "text",
						content:
							"Here are good alternatives to calibrate, depending on context:\n\nFor matching / aligning accuracy:\n• Align\n• Adjust\n• Tune",
						timestamp: new Date(),
					},
				]}
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Demonstrates message rendering: user messages as small grey rounded pills on the right (sharpened bottom-right corner), assistant responses as full-width plain text on the left.",
			},
		},
	},
};

export const WithHeader: Story = {
	render: () => {
		function Demo() {
			const [modelId, setModelId] = useState("opus-4.7");
			const [modeId, setModeId] = useState("high");
			const [resetKey, setResetKey] = useState(0);
			return (
				<div className="wwc:h-[600px] wwc:w-[640px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
					<AIChat
						key={resetKey}
						availableContext={projectContext}
						onUploadFile={(files) => console.log("upload", files)}
						headerVariant="header"
						models={[
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
						]}
						selectedModelId={modelId}
						onSelectModel={setModelId}
						modes={[
							{
								id: "high",
								label: "High",
								icon: <Gauge className="wwc:h-3.5 wwc:w-3.5" />,
								description: "Deeper reasoning",
							},
							{
								id: "medium",
								label: "Medium",
								icon: <Gauge className="wwc:h-3.5 wwc:w-3.5" />,
								description: "Balanced effort",
							},
							{
								id: "low",
								label: "Low",
								icon: <Gauge className="wwc:h-3.5 wwc:w-3.5" />,
								description: "Fastest response",
							},
						]}
						selectedModeId={modeId}
						onSelectMode={setModeId}
						headerActions={[
							{id: "new", label: "New chat", icon: <Plus />, onSelect: () => setResetKey((k) => k + 1)},
							{id: "history", label: "Chat history", icon: <Clock />, onSelect: () => console.log("show history")},
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
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Header bar with a model dropdown + effort/mode dropdown on the left, and icon-button actions (New chat, History, Delete) on the right.",
			},
		},
	},
};

/** A centred note under the composer naming the context the assistant is working from. */
export const WithPageContext: Story = {
	render: () => (
		<div className="wwc:h-[600px] wwc:w-[640px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
			<AIChat
				availableContext={projectContext}
				contextNote="Using this page as context — Work Permits / Templates"
				suggestedPrompts={["Summarize what is on this page", "What needs approval?", "Explain this template"]}
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"`contextNote` renders a small centred line under the composer naming the context the assistant is " +
					"working from — the page it is open on, typically. It is a statement, not a control: nothing about " +
					"it is clickable, and it is omitted entirely when the prop is unset. Keep it short; it truncates.",
			},
		},
	},
};

/** `WithHeader` plus an editable conversation name — click the title to rename it. */
export const WithSessionName: Story = {
	render: () => {
		function Demo() {
			const [modelId, setModelId] = useState("opus-4.7");
			// Empty on purpose: the header shows the placeholder until a name exists. In production the
			// name is expected to be derived from the conversation; here it starts untitled and is
			// editable by hand.
			const [sessionName, setSessionName] = useState("");
			const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);
			const [resetKey, setResetKey] = useState(0);
			const sessions = [
				{id: "s1", name: "Zone 4 attendance gap", preview: "Three crews with no scans", updatedAt: "2h ago"},
				{id: "s2", name: "Missing exits — TR-DOUGLAS", preview: "61% from one contractor", updatedAt: "Yesterday"},
				{id: "s3", name: "Payroll exposure review", preview: "574 timecards unverified", updatedAt: "Mon"},
				{id: "s4", name: "", preview: "Untitled, never sent", updatedAt: "Mon"},
			];
			return (
				<div className="wwc:h-[600px] wwc:w-[640px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
					<AIChat
						key={resetKey}
						availableContext={projectContext}
						headerVariant="header"
						sessionName={sessionName}
						onSessionNameChange={setSessionName}
						sessionNamePlaceholder="New chat"
						sessions={sessions}
						activeSessionId={activeSessionId}
						onSelectSession={(id) => {
							setActiveSessionId(id);
							setSessionName(sessions.find((x) => x.id === id)?.name ?? "");
						}}
						models={[
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
						]}
						selectedModelId={modelId}
						onSelectModel={setModelId}
						headerActions={[
							{
								id: "new",
								label: "New chat",
								icon: <Plus />,
								onSelect: () => {
									setSessionName("");
									setActiveSessionId(undefined);
									setResetKey((k) => k + 1);
								},
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
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"The `header` variant with a **conversation name** leading the left cluster. Click it to rename: " +
					"Enter or blur commits, Escape reverts. It starts empty so the `sessionNamePlaceholder` shows — " +
					"the name is expected to be set from the conversation later, and re-seeds itself if it changes " +
					"underneath while not being edited. Omit `onSessionNameChange` to render the name as static text.\n\n" +
					"Passing `sessions` adds the **history** action to the header. It opens a list of past " +
					"conversations in place of the thread; **Back** returns to whatever was underneath — the session " +
					"you were reading or an untouched new one — because opening history never mutates the conversation. " +
					"Picking a row fires `onSelectSession` and closes the list.",
			},
		},
	},
};

export const Controlled: Story = {
	render: () => {
		function Demo() {
			const [messages, setMessages] = useState<Message[]>([]);
			const [isLoading, setIsLoading] = useState(false);

			const handleSend = async (content: string) => {
				const userMessage: Message = {
					id: `u-${Date.now()}`,
					role: "user",
					type: "text",
					content,
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, userMessage]);
				setIsLoading(true);

				await new Promise((r) => setTimeout(r, 1000));

				const reply: Message = {
					id: `a-${Date.now()}`,
					role: "assistant",
					type: "text",
					content: `Synthetic reply to: "${content}". This came from a custom onSendMessage handler — AIChat didn't manage messages or isLoading internally.`,
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, reply]);
				setIsLoading(false);
			};

			return (
				<div className="wwc:h-[600px] wwc:w-[640px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
					<AIChat messages={messages} onMessagesChange={setMessages} onSendMessage={handleSend} isLoading={isLoading} />
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Fully controlled: consumer owns `messages` (via `onMessagesChange`), provides a custom `onSendMessage`, and drives `isLoading`. Watch the ThinkingPill + live TurnTimer during the 1s delay; a frozen TurnTimer appears under the assistant response when complete.",
			},
		},
	},
};

export const Streaming: Story = {
	render: () => {
		function Demo() {
			const [messages, setMessages] = useState<Message[]>([]);
			const [isLoading, setIsLoading] = useState(false);

			const handleSend = async (content: string) => {
				const userMessage: Message = {
					id: `u-${Date.now()}`,
					role: "user",
					type: "text",
					content,
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, userMessage]);
				setIsLoading(true);

				const replyId = `a-${Date.now()}`;
				const fullText =
					"This response is being streamed in chunks. The consumer mutates the same message id over five seconds, calling onMessagesChange repeatedly. AIChat's TurnTimer keeps ticking until isLoading flips false.";
				const words = fullText.split(" ");
				const chunkSize = Math.ceil(words.length / 10);

				// Append empty assistant message first.
				setMessages((prev) => [
					...prev,
					{id: replyId, role: "assistant", type: "text", content: "", timestamp: new Date()},
				]);

				for (let i = 1; i <= 10; i++) {
					await new Promise((r) => setTimeout(r, 500));
					const partial = words.slice(0, chunkSize * i).join(" ");
					setMessages((prev) =>
						prev.map((m) => (m.id === replyId && m.type === "text" ? {...m, content: partial} : m)),
					);
				}

				setIsLoading(false);
			};

			return (
				<div className="wwc:h-[600px] wwc:w-[640px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
					<AIChat messages={messages} onMessagesChange={setMessages} onSendMessage={handleSend} isLoading={isLoading} />
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Streaming pattern: consumer mutates the same assistant message id repeatedly via `onMessagesChange`. The response renders progressively without flicker; the live TurnTimer ticks while isLoading is true and freezes with the correct elapsed time when streaming completes.",
			},
		},
	},
};
