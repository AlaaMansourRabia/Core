import {cn} from "@core/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

import {Avatar, AvatarFallback, AvatarImage} from "./avatar";

const chatMessageVariants = cva("wwc:flex wwc:gap-3 wwc:py-4", {
	variants: {
		variant: {
			user: "wwc:flex-row-reverse",
			assistant: "wwc:flex-row",
			system: "wwc:justify-center",
		},
	},
	defaultVariants: {
		variant: "assistant",
	},
});

const chatMessageBubbleVariants = cva("wwc:rounded-2xl wwc:px-4 wwc:py-2.5 wwc:max-w-[80%]", {
	variants: {
		variant: {
			user: "wwc:bg-primary wwc:text-primary-foreground wwc:rounded-br-sm",
			assistant: "wwc:bg-muted wwc:text-foreground wwc:rounded-bl-sm",
			system: "wwc:bg-transparent wwc:text-muted-foreground wwc:text-sm wwc:italic",
		},
	},
	defaultVariants: {
		variant: "assistant",
	},
});

export interface ChatMessageProps
	extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chatMessageVariants> {
	/** Message content */
	children: React.ReactNode;
	/** Avatar image URL */
	avatar?: string;
	/** Avatar fallback text */
	avatarFallback?: string;
	/** Show avatar */
	showAvatar?: boolean;
	/** Timestamp for the message */
	timestamp?: string | Date;
	/** Whether the message is being streamed */
	isStreaming?: boolean;
}

/** Individual chat message bubble with avatar and optional metadata. */
const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
	(
		{
			className,
			variant = "assistant",
			children,
			avatar,
			avatarFallback,
			showAvatar = true,
			timestamp,
			isStreaming = false,
			...props
		},
		ref,
	) => {
		const formattedTime =
			timestamp instanceof Date
				? timestamp.toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"})
				: timestamp;

		if (variant === "system") {
			return (
				<div ref={ref} className={cn(chatMessageVariants({variant}), className)} {...props}>
					<div className={chatMessageBubbleVariants({variant})}>{children}</div>
				</div>
			);
		}

		return (
			<div ref={ref} className={cn(chatMessageVariants({variant}), className)} {...props}>
				{showAvatar && (
					<Avatar size="sm" className="wwc:flex-shrink-0">
						{avatar && <AvatarImage src={avatar} alt="Avatar" />}
						<AvatarFallback>{avatarFallback || (variant === "user" ? "U" : "A")}</AvatarFallback>
					</Avatar>
				)}
				<div className="wwc:flex wwc:flex-col wwc:gap-1 wwc:min-w-0">
					<div className={chatMessageBubbleVariants({variant})}>
						{children}
						{isStreaming && (
							<span className="wwc:inline-block wwc:w-2 wwc:h-4 wwc:bg-current wwc:animate-pulse wwc:ml-1" />
						)}
					</div>
					{formattedTime && (
						<span
							className={cn(
								"wwc:text-xs wwc:text-muted-foreground wwc:px-1",
								variant === "user" ? "wwc:text-right" : "wwc:text-left",
							)}
						>
							{formattedTime}
						</span>
					)}
				</div>
			</div>
		);
	},
);
ChatMessage.displayName = "ChatMessage";

export interface ChatMessageMetadataProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Label for the metadata */
	label?: string;
}

/** Metadata display for chat messages (tokens, model, etc.) */
const ChatMessageMetadata = React.forwardRef<HTMLDivElement, ChatMessageMetadataProps>(
	({className, label, children, ...props}, ref) => (
		<div
			ref={ref}
			className={cn("wwc:flex wwc:items-center wwc:gap-2 wwc:text-xs wwc:text-muted-foreground", className)}
			{...props}
		>
			{label && <span className="wwc:font-medium">{label}:</span>}
			{children}
		</div>
	),
);
ChatMessageMetadata.displayName = "ChatMessageMetadata";

export interface ChatSystemMessageProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Icon to display */
	icon?: React.ReactNode;
}

/** System notification message in chat (user joined, typing indicator, etc.) */
const ChatSystemMessage = React.forwardRef<HTMLDivElement, ChatSystemMessageProps>(
	({className, icon, children, ...props}, ref) => (
		<div
			ref={ref}
			className={cn(
				"wwc:flex wwc:items-center wwc:justify-center wwc:gap-2 wwc:py-2 wwc:text-xs wwc:text-muted-foreground",
				className,
			)}
			{...props}
		>
			{icon}
			<span>{children}</span>
		</div>
	),
);
ChatSystemMessage.displayName = "ChatSystemMessage";

export {ChatMessage, ChatMessageMetadata, ChatSystemMessage, chatMessageVariants, chatMessageBubbleVariants};
