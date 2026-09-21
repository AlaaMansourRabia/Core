import {Check, Plus, Sparkles} from "lucide-react";
import {useState} from "react";

import {Button} from "../button";
import {Card, CardContent} from "../card";
import {generateId} from "../services/chatService";
import type {DashboardWidget, Message} from "../types/chat";
import {ChartRenderer} from "./core-chart-renderer";

interface ChatMessageProps {
	message: Message;
	onAddWidget?: (widget: DashboardWidget) => void;
	userName?: string;
}

export function ChatMessage({message, onAddWidget, userName}: ChatMessageProps) {
	const [isAdded, setIsAdded] = useState(message.type === "chart" ? message.isAddedToPage : false);

	const isUser = message.role === "user";
	const isChart = message.type === "chart";

	const handleAddToPage = () => {
		if (message.type !== "chart" || isAdded || !onAddWidget) return;

		const widget: DashboardWidget = {
			id: generateId(),
			chartData: message.chartData,
			title: message.chartData.title || "Chart",
			addedAt: new Date(),
			targetTab: message.targetTab || "performance",
		};

		onAddWidget(widget);
		setIsAdded(true);
	};

	const formatTime = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		}).format(date);
	};

	return (
		<div className={`wwc:flex wwc:flex-col ${isUser ? "wwc:items-end" : "wwc:items-start"}`}>
			{/* Sender name */}
			{isUser && userName && (
				<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground wwc:mb-1 wwc:px-1">{userName}</span>
			)}

			{/* Message content */}
			<div
				className={`wwc:flex wwc:flex-col wwc:gap-1 ${isUser ? "wwc:items-end" : "wwc:items-start"} wwc:max-w-[85%]`}
			>
				<div
					className={`wwc:rounded-2xl wwc:px-4 wwc:py-2.5 ${
						isUser
							? "wwc:bg-primary wwc:text-primary-foreground wwc:rounded-br-md"
							: "wwc:bg-muted wwc:text-foreground wwc:rounded-bl-md"
					} ${isChart ? "wwc:w-full" : ""}`}
				>
					{/* Text content */}
					<p className="wwc:text-sm wwc:leading-relaxed wwc:whitespace-pre-wrap">{message.content}</p>

					{/* Chart content */}
					{isChart && (
						<Card className="wwc:mt-3 wwc:overflow-hidden">
							<CardContent className="wwc:p-0">
								<div className="wwc:p-3">
									<ChartRenderer chartData={message.chartData} height={220} />
								</div>
								{/* Add to page button */}
								{onAddWidget && (
									<div className="wwc:border-t wwc:bg-muted/30 wwc:px-3 wwc:py-2 wwc:flex wwc:items-center wwc:justify-between">
										<span className="wwc:text-xs wwc:text-muted-foreground wwc:flex wwc:items-center wwc:gap-1">
											<Sparkles className="wwc:h-3 wwc:w-3" />
											AI Generated
										</span>
										<Button
											size="sm"
											variant={isAdded ? "secondary" : "default"}
											className={`wwc:h-7 wwc:text-xs ${
												isAdded
													? "wwc:bg-muted wwc:text-muted-foreground wwc:cursor-not-allowed"
													: "wwc:bg-emerald-600 wwc:hover:bg-emerald-700 wwc:text-white"
											}`}
											onClick={handleAddToPage}
											disabled={isAdded}
										>
											{isAdded ? (
												<>
													<Check className="wwc:h-3 wwc:w-3" />
													Added
												</>
											) : (
												<>
													<Plus className="wwc:h-3 wwc:w-3" />
													Add to Page
												</>
											)}
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>

				{/* Timestamp */}
				<span className="wwc:text-[10px] wwc:text-muted-foreground wwc:px-1">{formatTime(message.timestamp)}</span>
			</div>
		</div>
	);
}

// Typing indicator component
export function TypingIndicator() {
	return (
		<div className="wwc:flex wwc:items-start">
			<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:rounded-2xl wwc:rounded-bl-md wwc:bg-muted wwc:px-4 wwc:py-3">
				<span
					className="wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-muted-foreground/50 wwc:animate-bounce"
					style={{animationDelay: "0ms"}}
				/>
				<span
					className="wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-muted-foreground/50 wwc:animate-bounce"
					style={{animationDelay: "150ms"}}
				/>
				<span
					className="wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-muted-foreground/50 wwc:animate-bounce"
					style={{animationDelay: "300ms"}}
				/>
			</div>
		</div>
	);
}
