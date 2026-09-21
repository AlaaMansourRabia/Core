import {Sparkles} from "lucide-react";
import {useCallback, useEffect, useState} from "react";

import {generateId, sendChatMessage} from "../services/chatService";
import type {ChartMessage, DashboardWidget, Message, TextMessage} from "../types/chat";
import {ChatPanel} from "./core-chat-panel";

interface ChatWidgetProps {
	onAddWidget?: (widget: DashboardWidget) => void;
	apiEndpoint?: string;
	userName?: string;
}

/** Embedded chat widget for user support and AI-powered conversations. */
export function ChatWidget({onAddWidget, apiEndpoint, userName}: ChatWidgetProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				setIsOpen(false);
				setIsMinimized(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	const handleOpen = useCallback(() => {
		setIsOpen(true);
		setIsMinimized(false);
	}, []);

	const handleClose = useCallback(() => {
		setIsOpen(false);
		setIsMinimized(false);
	}, []);

	const handleMinimize = useCallback(() => {
		setIsMinimized(true);
	}, []);

	const handleMaximize = useCallback(() => {
		setIsMinimized(false);
	}, []);

	const handleSendMessage = useCallback(
		async (content: string) => {
			// Add user message
			const userMessage: TextMessage = {
				id: generateId(),
				role: "user",
				type: "text",
				content,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, userMessage]);
			setIsLoading(true);

			try {
				// Get AI response
				const response = await sendChatMessage(content, apiEndpoint);

				// Add assistant message
				if (response.chart) {
					const chartMessage: ChartMessage = {
						id: generateId(),
						role: "assistant",
						type: "chart",
						content: response.message,
						chartData: response.chart,
						timestamp: new Date(),
						targetTab: response.targetTab,
					};
					setMessages((prev) => [...prev, chartMessage]);
				} else {
					const textMessage: TextMessage = {
						id: generateId(),
						role: "assistant",
						type: "text",
						content: response.message,
						timestamp: new Date(),
					};
					setMessages((prev) => [...prev, textMessage]);
				}
			} catch (error) {
				// Add error message
				const errorMessage: TextMessage = {
					id: generateId(),
					role: "assistant",
					type: "text",
					content: "Sorry, I couldn't generate that chart. Please try again.",
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, errorMessage]);
			} finally {
				setIsLoading(false);
			}
		},
		[apiEndpoint],
	);

	// Floating button when closed
	if (!isOpen) {
		return (
			<div className="wwc:fixed wwc:bottom-6 wwc:right-6 wwc:z-[9999]">
				{/* Animated gradient border wrapper */}
				<div className="ai-assistant-trigger wwc:relative wwc:rounded-full wwc:p-[2px] wwc:bg-gradient-to-r wwc:from-violet-500 wwc:via-pink-500 wwc:via-amber-400 wwc:to-violet-500 wwc:bg-[length:200%_100%] wwc:animate-gradient-x">
					<button
						onClick={handleOpen}
						className="wwc:flex wwc:items-center wwc:gap-2 wwc:px-4 wwc:py-3 wwc:rounded-full wwc:bg-white wwc:text-gray-800 wwc:transition-all wwc:duration-300 wwc:hover:bg-gray-50 wwc:active:scale-95"
						aria-label="Open Wakecap Assistant"
					>
						<Sparkles className="wwc:h-5 wwc:w-5 wwc:text-violet-600" fill="currentColor" />
						<span className="wwc:text-sm wwc:font-medium">Wakecap Assistant</span>
					</button>
				</div>
			</div>
		);
	}

	// Chat panel when open
	return (
		<ChatPanel
			messages={messages}
			isLoading={isLoading}
			isMinimized={isMinimized}
			onClose={handleClose}
			onMinimize={handleMinimize}
			onMaximize={handleMaximize}
			onSendMessage={handleSendMessage}
			onAddWidget={onAddWidget}
			userName={userName}
		/>
	);
}

// Re-export types for convenience
export type {DashboardWidget, Message} from "../types/chat";
