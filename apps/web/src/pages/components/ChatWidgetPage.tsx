import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ChatWidget} from "@/components/ui/chat/core-chat-widget";
import {CopyButton} from "@/components/ui/copy-button";

export function ChatWidgetPage() {
	const handleAddWidget = (widget: {id: string; title: string}) => {
		console.log("Add widget:", widget);
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Chat Widget</h1>
					<CopyButton
						value="Chat Widget"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					AI-powered chat assistant rendered as a floating button + panel in the bottom-right corner. Designed for
					dashboard interactions and ad-hoc data queries.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Chat Widget - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Click the chat button in the bottom-right corner of the panel to open the widget.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:rounded-lg wwc:p-4 wwc:relative" style={{height: "600px"}}>
						<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center wwc:text-muted-foreground">
							<p>Click the chat button in the bottom-right corner to open the chat widget.</p>
						</div>
						<ChatWidget onAddWidget={handleAddWidget} userName="Demo User" />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Composition</CardTitle>
						<CopyButton
							value="Chat Widget - Composition"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						The widget composes a floating launcher, conversation panel, message renderer, and inline chart suggestions
						for "add to dashboard" actions. Use{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">onAddWidget</code> to hook in your dashboard
						state.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {ChatWidget} from "@corensystem/core-ui/chat/core-chat-widget";

<ChatWidget
  userName="Demo User"
  onAddWidget={(widget) => {
    // Persist the suggested chart to your dashboard
  }}
/>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
