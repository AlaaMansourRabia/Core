import type {Message} from "@corensystem/core-ui/types/chat";

import {Bot, Sparkles} from "lucide-react";
import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {FloatingAssistant} from "@/components/ui/floating-assistant";

// A small self-contained demo: the consumer owns the conversation, so this canned handler stands in for a
// real backend. It appends the user message, "thinks", then replies.
function DemoAssistant({icon}: {icon?: React.ReactNode}) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false);
	let id = 0;
	const nextId = () => `m${(id += 1)}${messages.length}`;

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
				content: `You asked: “${content}”. In a real app you'd wire onSendMessage to your backend and stream a reply here.`,
				timestamp: new Date(),
			},
		]);
		setLoading(false);
	};

	return (
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
		/>
	);
}

export function FloatingAssistantPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Floating Assistant</h1>
					<CopyButton
						value="Floating Assistant"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					A corner-docked AI assistant: an icon-only round trigger that opens an <code>AIChat</code> panel. The
					conversation is <strong>controlled by the consumer</strong> (<code>messages</code> +{" "}
					<code>onSendMessage</code>), so any domain logic can drive the replies.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default (Loader icon)</CardTitle>
						<CopyButton
							value="Floating Assistant - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						The trigger is icon-only and defaults to the lucide <code>Loader</code> glyph. Click the button in the
						bottom-right corner of the screen to open the panel.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:relative wwc:rounded-lg wwc:border wwc:p-4" style={{height: "160px"}}>
						<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center wwc:text-muted-foreground">
							<p>Look to the bottom-right corner → click the round assistant button.</p>
						</div>
						<DemoAssistant />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Custom icon</CardTitle>
						<CopyButton
							value="Floating Assistant - Custom icon"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pass any node to <code>icon</code> to override the default — e.g. <code>Sparkles</code> or <code>Bot</code>.
						(This second instance also floats bottom-right; both demos share the corner.)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-6 wwc:text-sm wwc:text-muted-foreground">
						<span className="wwc:inline-flex wwc:items-center wwc:gap-2">
							<Sparkles className="wwc:h-4 wwc:w-4" /> <code>icon={"{<Sparkles />}"}</code>
						</span>
						<span className="wwc:inline-flex wwc:items-center wwc:gap-2">
							<Bot className="wwc:h-4 wwc:w-4" /> <code>icon={"{<Bot />}"}</code>
						</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Floating Assistant - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:overflow-x-auto wwc:rounded-lg wwc:bg-muted wwc:p-4 wwc:text-sm">
						{`import {FloatingAssistant} from "@corensystem/core-ui/floating-assistant";

const [messages, setMessages] = useState([]);
const [loading, setLoading] = useState(false);

<FloatingAssistant
  messages={messages}
  onMessagesChange={setMessages}
  isLoading={loading}
  onSendMessage={async (text) => {
    // append user + assistant messages, toggle loading
  }}
  suggestedPrompts={["Summarize this page", "What can you do?"]}
/>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
