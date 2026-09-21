import {
	BarChart3,
	ChevronLeft,
	ChevronRight,
	GripVertical,
	LayoutGrid,
	MoreVertical,
	Plus,
	Send,
	Sparkles,
	ThumbsDown,
	ThumbsUp,
	Trash2,
} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {toast} from "sonner";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {ChartRenderer} from "../chat/core-chart-renderer";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../dialog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../dropdown-menu";
import {Empty} from "../empty";
import {ScrollArea} from "../scroll-area";
import {generateId, sendChatMessage} from "../services/chatService";
import type {Organization} from "../types";
import type {ChartData} from "../types/chat";

interface OrgAIReportProps {
	selectedOrg: Organization;
}

interface ReportWidget {
	id: string;
	title: string;
	chartData: ChartData;
	addedAt: Date;
}

interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	chartData?: ChartData;
	isLoading?: boolean;
	thinkingTime?: number;
	timestamp: Date;
}

/** AI-powered report generation with chat interface and dynamic chart widgets. */
export function OrgAIReport({selectedOrg: _selectedOrg}: OrgAIReportProps) {
	const [widgets, setWidgets] = useState<ReportWidget[]>([]);
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
	const [thinkingSeconds, setThinkingSeconds] = useState(0);
	const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
	const [addedMessageIds, setAddedMessageIds] = useState<Set<string>>(new Set());
	const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
	const [feedbackModalMessageId, setFeedbackModalMessageId] = useState<string | null>(null);
	const [negativeFeedbackText, setNegativeFeedbackText] = useState("");
	const chatEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Handle thumbs up feedback
	const handleThumbsUp = (messageId: string) => {
		setFeedback((prev) => ({
			...prev,
			[messageId]: "up",
		}));
		toast.success("Thanks for the feedback!");
	};

	// Handle thumbs down - open modal
	const handleThumbsDown = (messageId: string) => {
		setFeedbackModalMessageId(messageId);
		setNegativeFeedbackText("");
		setFeedbackModalOpen(true);
	};

	// Submit negative feedback
	const handleSubmitNegativeFeedback = () => {
		if (feedbackModalMessageId) {
			setFeedback((prev) => ({
				...prev,
				[feedbackModalMessageId]: "down",
			}));
		}
		setFeedbackModalOpen(false);
		setFeedbackModalMessageId(null);
		setNegativeFeedbackText("");
		toast.success("Thanks for the feedback!");
	};

	// Auto-scroll chat to bottom
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({behavior: "smooth"});
	}, [chatMessages]);

	// Cleanup thinking timer
	useEffect(() => {
		return () => {
			if (thinkingTimerRef.current) {
				clearInterval(thinkingTimerRef.current);
			}
		};
	}, []);

	// Handle sending a message
	const handleSend = async (message: string) => {
		if (!message.trim() || isLoading) return;

		const userMessage: ChatMessage = {
			id: generateId(),
			role: "user",
			content: message.trim(),
			timestamp: new Date(),
		};

		setChatMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setIsLoading(true);
		setThinkingSeconds(0);

		// Start thinking timer
		thinkingTimerRef.current = setInterval(() => {
			setThinkingSeconds((prev) => prev + 1);
		}, 1000);

		// Add loading message
		const loadingId = generateId();
		setChatMessages((prev) => [
			...prev,
			{id: loadingId, role: "assistant", content: "", isLoading: true, timestamp: new Date()},
		]);

		try {
			const startTime = Date.now();
			const response = await sendChatMessage(message);
			const thinkingTime = Math.round((Date.now() - startTime) / 1000);

			// Stop thinking timer
			if (thinkingTimerRef.current) {
				clearInterval(thinkingTimerRef.current);
			}

			// Remove loading and add response
			setChatMessages((prev) =>
				prev
					.filter((m) => m.id !== loadingId)
					.concat({
						id: generateId(),
						role: "assistant",
						content: response.message,
						chartData: response.chart,
						thinkingTime,
						timestamp: new Date(),
					}),
			);
		} catch (error) {
			if (thinkingTimerRef.current) {
				clearInterval(thinkingTimerRef.current);
			}
			setChatMessages((prev) =>
				prev
					.filter((m) => m.id !== loadingId)
					.concat({
						id: generateId(),
						role: "assistant",
						content: "Sorry, I couldn't generate that. Please try again.",
						timestamp: new Date(),
					}),
			);
		} finally {
			setIsLoading(false);
			setThinkingSeconds(0);
		}
	};

	// Add widget to canvas
	const handleAddToPage = (message: ChatMessage) => {
		if (!message.chartData || addedMessageIds.has(message.id)) return;

		// Find the user message that prompted this response
		const messageIndex = chatMessages.findIndex((m) => m.id === message.id);
		let title = "AI Generated Chart";

		// Look backwards to find the preceding user message
		for (let i = messageIndex - 1; i >= 0; i--) {
			if (chatMessages[i].role === "user") {
				// Use the user's query as the title, capitalize first letter
				const query = chatMessages[i].content.trim();
				title = query.charAt(0).toUpperCase() + query.slice(1);
				break;
			}
		}

		const widget: ReportWidget = {
			id: generateId(),
			title,
			chartData: message.chartData,
			addedAt: new Date(),
		};

		setWidgets((prev) => [...prev, widget]);
		setAddedMessageIds((prev) => new Set(prev).add(message.id));
	};

	// Remove widget from canvas
	const handleRemoveWidget = (widgetId: string) => {
		setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
	};

	// Handle key down in input
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend(inputValue);
		}
	};

	return (
		<div className="wwc:h-[calc(100vh-8rem)] wwc:flex">
			{/* Left Panel - AI Chat */}
			<div
				className={`${
					isPanelCollapsed ? "wwc:w-0" : "wwc:w-[400px]"
				} wwc:border-r wwc:bg-background wwc:flex wwc:flex-col wwc:transition-all wwc:duration-300 wwc:overflow-hidden wwc:shrink-0`}
			>
				{/* Chat Header */}
				<div className="wwc:h-14 wwc:border-b wwc:flex wwc:items-center wwc:justify-between wwc:px-4 wwc:shrink-0">
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Sparkles className="wwc:h-5 wwc:w-5 wwc:text-primary" fill="currentColor" />
						<span className="wwc:font-semibold">AI Report Builder</span>
					</div>
					<Button variant="ghost" icon onClick={() => setIsPanelCollapsed(true)}>
						<ChevronLeft className="wwc:h-4 wwc:w-4" />
					</Button>
				</div>

				{/* Chat Messages Area */}
				<ScrollArea className="wwc:flex-1">
					<div className="wwc:p-4">
						{/* Empty State */}
						{chatMessages.length === 0 && (
							<div className="wwc:h-full wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:py-12">
								<div className="wwc:text-center wwc:space-y-3">
									<div className="wwc:h-14 wwc:w-14 wwc:rounded-2xl wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center wwc:mx-auto">
										<Sparkles className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground" />
									</div>
									<h3 className="wwc:font-semibold wwc:text-lg">AI Report Builder</h3>
									<p className="wwc:text-sm wwc:text-muted-foreground wwc:max-w-[260px]">
										Generate charts, insights, and reports from your project data.
									</p>
								</div>
							</div>
						)}

						{/* Messages */}
						{chatMessages.length > 0 && (
							<div className="wwc:space-y-4">
								{chatMessages.map((message) => (
									<div
										key={message.id}
										className={`wwc:flex wwc:flex-col ${message.role === "user" ? "wwc:items-end" : "wwc:items-start"}`}
									>
										{message.role === "user" ? (
											/* User Message */
											<div className="wwc:max-w-[85%] wwc:bg-primary wwc:text-primary-foreground wwc:rounded-2xl wwc:rounded-br-md wwc:px-4 wwc:py-2.5">
												<p className="wwc:text-sm">{message.content}</p>
											</div>
										) : message.isLoading ? (
											/* Thinking Indicator */
											<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:px-1 wwc:py-2">
												<Sparkles className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground wwc:animate-pulse" />
												<span className="wwc:text-sm wwc:text-muted-foreground">
													Thinking for {thinkingSeconds}s...
												</span>
											</div>
										) : (
											/* AI Response */
											<div className="wwc:w-full wwc:space-y-3">
												{/* Thinking time */}
												{message.thinkingTime !== undefined && message.thinkingTime > 0 && (
													<div className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-xs wwc:text-muted-foreground">
														<Sparkles className="wwc:h-3 wwc:w-3" />
														<span>Thought for {message.thinkingTime}s</span>
													</div>
												)}

												{/* Response text */}
												<p className="wwc:text-sm wwc:leading-relaxed">{message.content}</p>

												{/* Chart Preview */}
												{message.chartData && (
													<Card className="wwc:overflow-hidden">
														<CardContent className="wwc:p-3">
															<ChartRenderer chartData={message.chartData} height={180} />
														</CardContent>
														<div className="wwc:px-3 wwc:pb-3">
															<Button
																size="sm"
																className="wwc:w-full wwc:gap-2"
																onClick={() => handleAddToPage(message)}
																disabled={addedMessageIds.has(message.id)}
															>
																<Plus className="wwc:h-4 wwc:w-4" />
																{addedMessageIds.has(message.id) ? "Added to Report" : "Add to Report"}
															</Button>
														</div>
													</Card>
												)}

												{/* Feedback buttons */}
												<div className="wwc:flex wwc:items-center wwc:gap-1">
													<button
														onClick={() => handleThumbsUp(message.id)}
														disabled={feedback[message.id] !== undefined}
														className={`wwc:p-1.5 wwc:rounded-md wwc:transition-colors ${
															feedback[message.id] === "up"
																? "wwc:text-foreground"
																: "wwc:text-muted-foreground wwc:hover:bg-muted wwc:hover:text-foreground wwc:disabled:hover:bg-transparent"
														}`}
														aria-label="Good response"
													>
														<ThumbsUp
															className="wwc:h-4 wwc:w-4"
															fill={feedback[message.id] === "up" ? "currentColor" : "none"}
														/>
													</button>
													<button
														onClick={() => handleThumbsDown(message.id)}
														disabled={feedback[message.id] !== undefined}
														className={`wwc:p-1.5 wwc:rounded-md wwc:transition-colors ${
															feedback[message.id] === "down"
																? "wwc:text-foreground"
																: "wwc:text-muted-foreground wwc:hover:bg-muted wwc:hover:text-foreground wwc:disabled:hover:bg-transparent"
														}`}
														aria-label="Bad response"
													>
														<ThumbsDown
															className="wwc:h-4 wwc:w-4"
															fill={feedback[message.id] === "down" ? "currentColor" : "none"}
														/>
													</button>
												</div>
											</div>
										)}
									</div>
								))}
								<div ref={chatEndRef} />
							</div>
						)}
					</div>
				</ScrollArea>

				{/* Chat Input */}
				<div className="wwc:p-4 wwc:border-t wwc:shrink-0 wwc:space-y-3">
					{/* Quick suggestion chips - horizontal scroll without scrollbar */}
					<div
						className="wwc:flex wwc:gap-2 wwc:overflow-x-auto scrollbar-hide"
						style={{scrollbarWidth: "none", msOverflowStyle: "none"}}
					>
						<button
							onClick={() => setInputValue("Create in-depth analysis")}
							disabled={isLoading}
							className="wwc:px-3 wwc:py-1.5 wwc:text-xs wwc:font-medium wwc:border wwc:rounded-full wwc:hover:bg-muted wwc:transition-colors wwc:disabled:opacity-50 wwc:whitespace-nowrap wwc:shrink-0"
						>
							Create in-depth analysis
						</button>
						<button
							onClick={() => setInputValue("Show workforce trends")}
							disabled={isLoading}
							className="wwc:px-3 wwc:py-1.5 wwc:text-xs wwc:font-medium wwc:border wwc:rounded-full wwc:hover:bg-muted wwc:transition-colors wwc:disabled:opacity-50 wwc:whitespace-nowrap wwc:shrink-0"
						>
							Show workforce trends
						</button>
						<button
							onClick={() => setInputValue("Compare project metrics")}
							disabled={isLoading}
							className="wwc:px-3 wwc:py-1.5 wwc:text-xs wwc:font-medium wwc:border wwc:rounded-full wwc:hover:bg-muted wwc:transition-colors wwc:disabled:opacity-50 wwc:whitespace-nowrap wwc:shrink-0"
						>
							Compare project metrics
						</button>
						<button
							onClick={() => setInputValue("Safety incident report")}
							disabled={isLoading}
							className="wwc:px-3 wwc:py-1.5 wwc:text-xs wwc:font-medium wwc:border wwc:rounded-full wwc:hover:bg-muted wwc:transition-colors wwc:disabled:opacity-50 wwc:whitespace-nowrap wwc:shrink-0"
						>
							Safety incident report
						</button>
						<button
							onClick={() => setInputValue("Cost breakdown by project")}
							disabled={isLoading}
							className="wwc:px-3 wwc:py-1.5 wwc:text-xs wwc:font-medium wwc:border wwc:rounded-full wwc:hover:bg-muted wwc:transition-colors wwc:disabled:opacity-50 wwc:whitespace-nowrap wwc:shrink-0"
						>
							Cost breakdown by project
						</button>
						<button
							onClick={() => setInputValue("Overtime hours analysis")}
							disabled={isLoading}
							className="wwc:px-3 wwc:py-1.5 wwc:text-xs wwc:font-medium wwc:border wwc:rounded-full wwc:hover:bg-muted wwc:transition-colors wwc:disabled:opacity-50 wwc:whitespace-nowrap wwc:shrink-0"
						>
							Overtime hours analysis
						</button>
					</div>

					{/* Input area */}
					<div className="wwc:relative wwc:bg-muted/50 wwc:rounded-2xl wwc:border">
						<textarea
							ref={inputRef}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Ask, write or search for anything..."
							disabled={isLoading}
							rows={2}
							className="wwc:w-full wwc:resize-none wwc:bg-transparent wwc:px-4 wwc:pt-3 wwc:pb-10 wwc:text-sm wwc:focus:outline-none wwc:disabled:opacity-50 wwc:placeholder:text-muted-foreground wwc:min-h-[80px] wwc:max-h-[120px]"
						/>
						<div className="wwc:absolute wwc:bottom-3 wwc:right-3">
							<Button
								icon
								onClick={() => handleSend(inputValue)}
								disabled={isLoading || !inputValue.trim()}
								className="wwc:rounded-full"
							>
								<Send className="wwc:h-4 wwc:w-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Collapse/Expand Button */}
			{isPanelCollapsed && (
				<Button
					variant="outline"
					icon
					className="wwc:absolute wwc:left-3 wwc:top-1/2 wwc:-translate-y-1/2 wwc:z-10 wwc:h-10 wwc:w-10 wwc:rounded-full wwc:bg-background wwc:shadow-md"
					onClick={() => setIsPanelCollapsed(false)}
				>
					<ChevronRight className="wwc:h-5 wwc:w-5" />
				</Button>
			)}

			{/* Right Panel - Canvas */}
			<div className="wwc:flex-1 wwc:flex wwc:flex-col wwc:min-w-0 wwc:bg-muted/30">
				{/* Canvas Header */}
				<div className="wwc:h-14 wwc:border-b wwc:bg-background wwc:flex wwc:items-center wwc:justify-between wwc:px-4 wwc:shrink-0">
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<LayoutGrid className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />
						<span className="wwc:font-medium">Report Canvas</span>
						{widgets.length > 0 && <Badge variant="secondary">{widgets.length} widgets</Badge>}
					</div>
				</div>

				{/* Canvas Content */}
				<div className="wwc:flex-1 wwc:overflow-auto wwc:p-6">
					{widgets.length === 0 ? (
						<Empty
							icon={<BarChart3 className="wwc:h-10 wwc:w-10" />}
							title="No reports yet"
							description="Use the AI assistant to generate charts, tables, and insights. Add them to your report canvas."
							action={
								isPanelCollapsed ? (
									<Button
										className="wwc:gap-2"
										onClick={() => {
											setIsPanelCollapsed(false);
											inputRef.current?.focus();
										}}
									>
										<Sparkles className="wwc:h-4 wwc:w-4" fill="currentColor" />
										Generate with AI
									</Button>
								) : undefined
							}
						/>
					) : (
						/* Widgets Grid */
						<div className="wwc:grid wwc:grid-cols-1 wwc:lg:grid-cols-2 wwc:gap-4">
							{/* Add More Card - Only show when chat is collapsed, as first item */}
							{isPanelCollapsed && (
								<Card
									className="wwc:border-dashed wwc:flex wwc:items-center wwc:justify-center wwc:min-h-[300px] wwc:cursor-pointer wwc:hover:bg-muted/50 wwc:transition-colors"
									onClick={() => {
										setIsPanelCollapsed(false);
										inputRef.current?.focus();
									}}
								>
									<div className="wwc:text-center wwc:space-y-2">
										<div className="wwc:h-12 wwc:w-12 wwc:rounded-full wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center wwc:mx-auto">
											<Plus className="wwc:h-6 wwc:w-6 wwc:text-muted-foreground" />
										</div>
										<p className="wwc:text-sm wwc:text-muted-foreground">Generate another report</p>
									</div>
								</Card>
							)}

							{widgets.map((widget) => (
								<Card key={widget.id} className="wwc:group wwc:relative">
									<CardHeader className="wwc:pb-2">
										<div className="wwc:flex wwc:items-start wwc:justify-between">
											<div className="wwc:flex wwc:items-center wwc:gap-2">
												<GripVertical className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground wwc:opacity-0 wwc:group-hover:opacity-100 wwc:transition-opacity wwc:cursor-grab" />
												<CardTitle className="wwc:text-sm wwc:font-medium wwc:line-clamp-1">{widget.title}</CardTitle>
											</div>
											<div className="wwc:flex wwc:items-center wwc:gap-1">
												<Badge variant="secondary" className="wwc:text-xs">
													<Sparkles className="wwc:h-3 wwc:w-3" />
													AI
												</Badge>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															icon
															className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:transition-opacity"
														>
															<MoreVertical className="wwc:h-4 wwc:w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															className="wwc:text-destructive"
															onClick={() => handleRemoveWidget(widget.id)}
														>
															<Trash2 className="wwc:h-4 wwc:w-4 wwc:mr-2" />
															Remove
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<ChartRenderer chartData={widget.chartData} height={240} />
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Negative Feedback Modal */}
			<Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
				<DialogContent className="wwc:sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>What went wrong?</DialogTitle>
					</DialogHeader>
					<div className="wwc:px-4 wwc:py-4">
						<textarea
							value={negativeFeedbackText}
							onChange={(e) => setNegativeFeedbackText(e.target.value)}
							placeholder="Tell us what could be improved..."
							className="wwc:w-full wwc:min-h-[120px] wwc:rounded-lg wwc:border wwc:bg-muted/50 wwc:px-3 wwc:py-2 wwc:text-sm wwc:focus:outline-none wwc:focus:ring-2 wwc:focus:ring-primary/50 wwc:placeholder:text-muted-foreground wwc:resize-none"
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setFeedbackModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSubmitNegativeFeedback}>Submit Feedback</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
