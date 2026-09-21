import {cn} from "@wakecap/core-utils";
import {AtSign, Paperclip} from "lucide-react";

import {Card, CardContent} from "../card";
import type {Message} from "../types/chat";
import {ChartRenderer} from "./core-chart-renderer";

export interface AIChatMessageProps {
	message: Message;
}

/**
 * AI-style chat message:
 * - User messages: small grey rounded pill, right-aligned
 * - Assistant messages: full-width plain text/content, no bubble
 * - No timestamps, no sender names
 */
export function AIChatMessage({message}: AIChatMessageProps) {
	const isUser = message.role === "user";
	const isChart = message.type === "chart";

	const attachments = message.attachments ?? [];

	if (isUser) {
		return (
			<div className="wwc:flex wwc:justify-end">
				<div className="wwc:max-w-[80%] wwc:rounded-2xl wwc:rounded-br-md wwc:bg-muted wwc:px-4 wwc:py-2 wwc:text-sm wwc:text-foreground">
					{attachments.length > 0 && (
						<div className="wwc:mb-1.5 wwc:flex wwc:flex-wrap wwc:justify-end wwc:gap-1">
							{attachments.map((attachment) => (
								<span
									key={attachment.id}
									className="wwc:inline-flex wwc:max-w-full wwc:items-center wwc:gap-1 wwc:rounded-md wwc:border wwc:bg-card wwc:px-1.5 wwc:py-0.5 wwc:text-xs wwc:text-muted-foreground"
								>
									<span className="wwc:flex wwc:h-3 wwc:w-3 wwc:flex-shrink-0 wwc:items-center wwc:justify-center wwc:[&_svg]:h-3 wwc:[&_svg]:w-3">
										{attachment.icon ?? (attachment.type === "file" ? <Paperclip /> : <AtSign />)}
									</span>
									<span className="wwc:truncate">{attachment.label}</span>
								</span>
							))}
						</div>
					)}
					<p className="wwc:whitespace-pre-wrap wwc:leading-relaxed">{message.content}</p>
				</div>
			</div>
		);
	}

	// Assistant — full width, no bubble
	return (
		<div className="wwc:w-full">
			<div className="wwc:text-sm wwc:leading-relaxed wwc:text-foreground">
				<p className="wwc:whitespace-pre-wrap">{message.content}</p>
				{isChart && (
					<Card className="wwc:mt-3 wwc:overflow-hidden">
						<CardContent className="wwc:p-3">
							<ChartRenderer chartData={message.chartData} height={220} />
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

/** Three-dot typing indicator, full-width assistant style. */
export function AIChatTypingIndicator({className}: {className?: string}) {
	return (
		<div className={cn("wwc:flex wwc:w-full wwc:items-center wwc:gap-1.5", className)}>
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
	);
}
