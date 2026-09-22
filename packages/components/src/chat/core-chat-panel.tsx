import {Minus, Sparkles, X} from "lucide-react";
import {useEffect, useRef} from "react";

import {Button} from "../button";
import {ScrollArea} from "../scroll-area";
import type {DashboardWidget, Message} from "../types/chat";
import {ChatInput} from "./core-chat-input";
import {ChatMessage, TypingIndicator} from "./core-chat-message";

interface ChatPanelProps {
	messages: Message[];
	isLoading: boolean;
	isMinimized: boolean;
	onClose: () => void;
	onMinimize: () => void;
	onMaximize: () => void;
	onSendMessage: (message: string) => void;
	onAddWidget?: (widget: DashboardWidget) => void;
	userName?: string;
}

// Suggested prompts for empty state
const SUGGESTED_PROMPTS = [
	"Show me monthly sales trends",
	"Compare revenue by category",
	"What's our market share?",
	"User signups over time",
];

export function ChatPanel({
	messages,
	isLoading,
	isMinimized,
	onClose,
	onMinimize,
	onMaximize,
	onSendMessage,
	onAddWidget,
	userName,
}: ChatPanelProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
	}, [messages, isLoading]);

	if (isMinimized) {
		return (
			<div
				className="wwc:fixed wwc:bottom-6 wwc:right-6 wwc:z-[9999] wwc:flex wwc:items-center wwc:gap-3 wwc:rounded-full wwc:bg-primary wwc:px-4 wwc:py-3 wwc:text-primary-foreground wwc:shadow-lg wwc:cursor-pointer wwc:hover:bg-primary/90 wwc:transition-colors"
				onClick={onMaximize}
			>
				<Sparkles className="wwc:h-5 wwc:w-5" fill="currentColor" />
				<span className="wwc:text-sm wwc:font-medium">Core Assistant</span>
				<Button
					icon
					variant="ghost"
					className="wwc:h-6 wwc:w-6 wwc:rounded-full wwc:hover:bg-primary-foreground/20"
					onClick={(e) => {
						e.stopPropagation();
						onClose();
					}}
				>
					<X className="wwc:h-4 wwc:w-4" />
				</Button>
			</div>
		);
	}

	return (
		<div
			className="wwc:fixed wwc:bottom-6 wwc:right-6 wwc:z-[9999] wwc:flex wwc:flex-col wwc:bg-card wwc:border wwc:rounded-2xl wwc:shadow-[0_8px_32px_rgba(0,0,0,0.15)] wwc:overflow-hidden wwc:transition-all wwc:duration-300 wwc:ease-out"
			style={{
				width: "min(400px, calc(100vw - 48px))",
				height: "min(600px, calc(100vh - 100px))",
			}}
		>
			{/* Header */}
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:px-4 wwc:py-3 wwc:border-b wwc:bg-muted/30">
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<div className="wwc:flex wwc:h-8 wwc:w-8 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-primary wwc:text-primary-foreground">
						<Sparkles className="wwc:h-4 wwc:w-4" fill="currentColor" />
					</div>
					<div>
						<h3 className="wwc:text-sm wwc:font-semibold">Core Assistant</h3>
						<p className="wwc:text-xs wwc:text-muted-foreground">Ask about your data</p>
					</div>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-1">
					<Button icon variant="ghost" className="wwc:rounded-full" onClick={onMinimize}>
						<Minus className="wwc:h-4 wwc:w-4" />
					</Button>
					<Button icon variant="ghost" className="wwc:rounded-full" onClick={onClose}>
						<X className="wwc:h-4 wwc:w-4" />
					</Button>
				</div>
			</div>

			{/* Messages area */}
			<ScrollArea className="wwc:flex-1">
				<div className="wwc:p-4 wwc:space-y-4">
					{messages.length === 0 ? (
						// Empty state with suggestions
						<div className="wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:py-8 wwc:text-center">
							<div className="wwc:flex wwc:h-16 wwc:w-16 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-primary/10 wwc:mb-4">
								<Sparkles className="wwc:h-8 wwc:w-8 wwc:text-primary" fill="currentColor" />
							</div>
							<h4 className="wwc:text-sm wwc:font-medium wwc:mb-1">Welcome to Core Assistant</h4>
							<p className="wwc:text-xs wwc:text-muted-foreground wwc:mb-4 wwc:max-w-[280px]">
								Ask me about your data and I'll create visualizations for you
							</p>
							<div className="wwc:space-y-2 wwc:w-full">
								<p className="wwc:text-xs wwc:text-muted-foreground">Try asking:</p>
								<div className="wwc:flex wwc:flex-wrap wwc:gap-2 wwc:justify-center">
									{SUGGESTED_PROMPTS.map((prompt) => (
										<button
											key={prompt}
											onClick={() => onSendMessage(prompt)}
											className="wwc:text-xs wwc:px-3 wwc:py-1.5 wwc:rounded-full wwc:bg-muted wwc:hover:bg-muted/80 wwc:text-foreground wwc:transition-colors"
										>
											{prompt}
										</button>
									))}
								</div>
							</div>
						</div>
					) : (
						// Message list
						<>
							{messages.map((message) => (
								<ChatMessage key={message.id} message={message} onAddWidget={onAddWidget} userName={userName} />
							))}
							{isLoading && <TypingIndicator />}
						</>
					)}
					<div ref={messagesEndRef} />
				</div>
			</ScrollArea>

			{/* Input area */}
			<ChatInput onSend={onSendMessage} disabled={isLoading} />
		</div>
	);
}
