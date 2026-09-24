import type {Message} from "@corensystem/coren-ui/types/chat";
import type {Meta, StoryObj} from "storybook/internal/types";

import {FloatingAssistant} from "@corensystem/coren-ui/floating-assistant";
import {Bot, Sparkles} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Widgets/Chat/Floating Assistant",
	component: FloatingAssistant,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"An AI assistant that **docks to the right of the page**. An icon-only, corner-anchored trigger opens a " +
					"full-height `AIChat` panel that **takes layout width rather than floating over the page** — pass the page " +
					"content as `children` and it narrows to make room (built on `PushPanel`). The panel stretches to the row, " +
					"caps at the viewport and sticks, so the composer stays reachable on a long page. The " +
					"conversation is **controlled by the consumer** (`messages` + `onSendMessage` + `isLoading`), so any domain " +
					"logic can drive the replies. The trigger is the bare **Core brand mark** with no chrome behind it — it " +
					"takes `currentColor` from `foreground`, so it inverts with the theme. Pass `icon` to swap in any other " +
					"glyph. Related: `ChatWidget` (self-contained, bundled message service), `AIChat` (the inline panel).",
			},
		},
	},
} satisfies Meta<typeof FloatingAssistant>;

export default meta;
type Story = StoryObj<typeof meta>;

// Canned handler standing in for a backend: append the user message, "think", then reply.
function Demo({icon}: {icon?: React.ReactNode}) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false);
	const nextId = () => `m${messages.length}-${Math.round(performance.now())}`;

	const onSend = async (content: string) => {
		setMessages((prev) => [...prev, {id: nextId(), role: "user", type: "text", content, timestamp: new Date()}]);
		setLoading(true);
		await new Promise((r) => setTimeout(r, 600));
		setMessages((prev) => [
			...prev,
			{
				id: nextId(),
				role: "assistant",
				type: "text",
				content: `You asked: “${content}”. Wire onSendMessage to your backend to stream a real reply here.`,
				timestamp: new Date(),
			},
		]);
		setLoading(false);
	};

	return (
		// A full-height page, so the docked panel spans it end to end.
		<div className="wwc:h-screen wwc:w-full">
			<FloatingAssistant
				icon={icon}
				messages={messages}
				onMessagesChange={setMessages}
				onSendMessage={onSend}
				isLoading={loading}
				title="Assistant"
				subtitle="Ask a question to get started."
				placeholder="Ask anything…"
				suggestedPrompts={["Summarize this page", "What can you do?", "Show recent activity"]}
			>
				{/* Stand-in page content — it narrows when the panel opens. */}
				<div className="wwc:flex wwc:h-full wwc:flex-col wwc:gap-4 wwc:p-6">
					<h2 className="wwc:text-2xl wwc:font-semibold wwc:tracking-tight">Project overview</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Click the assistant button in the bottom-right corner. The panel docks to the right at full height and this
						content narrows to make room.
					</p>
					<div className="wwc:grid wwc:grid-cols-2 wwc:gap-4">
						{["Workers on site", "Open observations", "Hours logged", "Compliance"].map((label) => (
							<div key={label} className="wwc:rounded-lg wwc:border wwc:border-border wwc:p-4">
								<div className="wwc:text-xs wwc:text-muted-foreground">{label}</div>
								<div className="wwc:mt-1 wwc:text-2xl wwc:font-semibold">—</div>
							</div>
						))}
					</div>
				</div>
			</FloatingAssistant>
		</div>
	);
}

/** Default trigger — the bare Core brand mark, no chrome behind it. */
export const Default: Story = {
	render: () => <Demo />,
};

/** Override the mark with any glyph via the `icon` prop — the trigger chrome is unchanged. */
export const CustomIcon: Story = {
	render: () => <Demo icon={<Sparkles className="wwc:h-5 wwc:w-5" />} />,
};

/** A `Bot` icon reads clearly as an assistant. */
export const BotIcon: Story = {
	render: () => <Demo icon={<Bot className="wwc:h-5 wwc:w-5" />} />,
};
