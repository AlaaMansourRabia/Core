import {ChatWidget} from "@/components/ui/chat/core-chat-widget";

export function ChatWidgetDemo() {
	const handleAddWidget = (widget: {id: string; title: string}) => {
		console.log("Add wwc:widget:", widget);
		alert(`Widget wwc:added: ${widget.title}`);
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Chat Widget</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					AI-powered chat assistant for dashboard interactions and data queries.
				</p>
			</div>

			<div className="wwc:border wwc:rounded-lg wwc:p-4 wwc:relative" style={{height: "600px"}}>
				<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center wwc:text-muted-foreground">
					<p>Click the chat button in the bottom-right corner to open the chat widget.</p>
				</div>
				<ChatWidget onAddWidget={handleAddWidget} userName="Demo User" />
			</div>
		</div>
	);
}
