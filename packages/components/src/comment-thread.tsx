import {cn} from "@core/core-utils";
import {MoreHorizontal, SmilePlus} from "lucide-react";
import * as React from "react";

import {Avatar, AvatarFallback, AvatarImage} from "./avatar";
import {Badge} from "./badge";
import {Button} from "./button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "./dropdown-menu";

export interface CommentAuthor {
	id?: string;
	name: string;
	avatarUrl?: string;
	initials?: string;
}

export type CommentBadgeTone = "default" | "muted" | "warning" | "success" | "info";

export interface CommentBadge {
	id: string;
	icon?: React.ReactNode;
	label: string;
	tone?: CommentBadgeTone;
}

export interface CommentReaction {
	id: string;
	icon?: React.ReactNode;
	label?: string;
	count: number;
	active?: boolean;
}

export interface CommentAttachment {
	id: string;
	type?: "image" | "file";
	url?: string;
	thumbnailUrl?: string;
	name?: string;
	width?: number;
	height?: number;
}

export interface CommentMenuItem {
	id: string;
	label: string;
	icon?: React.ReactNode;
	tone?: "default" | "destructive";
	onSelect?: () => void;
}

export interface CommentItem {
	id: string;
	author: CommentAuthor;
	timestamp: React.ReactNode;
	body: React.ReactNode;
	badges?: CommentBadge[];
	attachments?: CommentAttachment[];
	reactions?: CommentReaction[];
	replies?: CommentItem[];
	menu?: CommentMenuItem[];
	onReact?: (reactionId: string) => void;
	onAddReaction?: () => void;
	onReply?: () => void;
}

const badgeToneClass: Record<CommentBadgeTone, string> = {
	default: "wwc:bg-muted wwc:text-foreground",
	muted: "wwc:bg-muted wwc:text-muted-foreground",
	warning: "wwc:bg-amber-50 wwc:text-amber-800",
	success: "wwc:bg-emerald-50 wwc:text-emerald-700",
	info: "wwc:bg-blue-50 wwc:text-blue-700",
};

function authorInitials(author: CommentAuthor): string {
	if (author.initials) return author.initials;
	const parts = author.name.trim().split(/\s+/);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export interface CommentProps {
	comment: CommentItem;
	depth?: number;
}

export function Comment({comment, depth = 0}: CommentProps) {
	const isReply = depth > 0;
	const hasReplies = comment.replies !== undefined && comment.replies.length > 0;
	const avatarSize = isReply ? "wwc:h-6 wwc:w-6" : "wwc:h-8 wwc:w-8";
	const avatarText = isReply ? "wwc:text-[11px]" : "wwc:text-xs";

	return (
		<div className="wwc:relative wwc:w-full">
			{hasReplies && (
				<span
					aria-hidden="true"
					className={cn(
						"wwc:absolute wwc:left-4 wwc:top-4 wwc:bottom-3 wwc:w-px wwc:bg-border",
						isReply && "wwc:left-3 wwc:top-3",
					)}
				/>
			)}
			<div className="wwc:relative wwc:flex wwc:w-full wwc:gap-3">
				<Avatar className={cn(avatarSize, "wwc:z-10 wwc:shrink-0")}>
					{comment.author.avatarUrl && <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />}
					<AvatarFallback className={cn(avatarText, "wwc:font-semibold")}>
						{authorInitials(comment.author)}
					</AvatarFallback>
				</Avatar>

				<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:gap-1.5">
					<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
						<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2">
							<span className="wwc:truncate wwc:text-sm wwc:font-semibold wwc:text-foreground">
								{comment.author.name}
							</span>
							<span className="wwc:shrink-0 wwc:text-xs wwc:text-muted-foreground">{comment.timestamp}</span>
							{comment.badges?.map((b) => (
								<Badge
									key={b.id}
									variant="secondary"
									className={cn(
										"wwc:gap-1 wwc:rounded-md wwc:px-2 wwc:py-0.5 wwc:text-[11px] wwc:font-medium",
										badgeToneClass[b.tone ?? "default"],
									)}
								>
									{b.icon}
									{b.label}
								</Badge>
							))}
						</div>
						{comment.menu && comment.menu.length > 0 && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button type="button" variant="ghost" icon className="wwc:h-6 wwc:w-6" aria-label="More">
										<MoreHorizontal />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{comment.menu.map((item) => (
										<DropdownMenuItem
											key={item.id}
											onSelect={() => item.onSelect?.()}
											className={cn(item.tone === "destructive" && "wwc:text-destructive")}
										>
											{item.icon}
											{item.label}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>

					<div className="wwc:text-sm wwc:text-foreground">{comment.body}</div>

					{comment.attachments && comment.attachments.length > 0 && (
						<div className="wwc:mt-1 wwc:flex wwc:flex-wrap wwc:gap-2">
							{comment.attachments.map((att) => (
								<CommentAttachmentTile key={att.id} attachment={att} />
							))}
						</div>
					)}

					{(comment.reactions?.length || comment.onAddReaction || comment.onReply) && (
						<div className="wwc:mt-1 wwc:flex wwc:items-center wwc:gap-1">
							{comment.reactions?.map((r) => (
								<Button
									key={r.id}
									type="button"
									variant={r.active ? "secondary" : "outline"}
									size="sm"
									className="wwc:h-7 wwc:gap-1.5 wwc:rounded-md wwc:px-2 wwc:text-xs"
									onClick={() => comment.onReact?.(r.id)}
									aria-label={r.label ? `${r.label} reaction (${r.count})` : `${r.count} reactions`}
								>
									{r.icon}
									{r.count}
								</Button>
							))}
							{comment.onAddReaction && (
								<Button
									type="button"
									variant="ghost"
									icon
									className="wwc:h-7 wwc:w-7"
									onClick={comment.onAddReaction}
									aria-label="Add reaction"
								>
									<SmilePlus />
								</Button>
							)}
							{comment.onReply && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="wwc:h-7 wwc:px-2 wwc:text-xs wwc:font-medium wwc:text-muted-foreground"
									onClick={comment.onReply}
								>
									Reply
								</Button>
							)}
						</div>
					)}
				</div>
			</div>

			{hasReplies && (
				<div className={cn("wwc:mt-2 wwc:flex wwc:flex-col wwc:gap-4 wwc:pl-8", isReply ? "wwc:ml-3" : "wwc:ml-4")}>
					{comment.replies!.map((reply) => (
						<div
							key={reply.id}
							className="wwc:relative wwc:before:absolute wwc:before:-left-8 wwc:before:top-3 wwc:before:h-px wwc:before:w-8 wwc:before:bg-border"
						>
							<Comment comment={reply} depth={depth + 1} />
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function CommentAttachmentTile({attachment}: {attachment: CommentAttachment}) {
	const isImage =
		attachment.type === "image" || (attachment.thumbnailUrl !== undefined && attachment.type === undefined);
	if (isImage && attachment.thumbnailUrl) {
		return (
			<a
				href={attachment.url ?? attachment.thumbnailUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:bg-muted"
			>
				<img
					src={attachment.thumbnailUrl}
					alt={attachment.name ?? "attachment"}
					className="wwc:max-h-48 wwc:w-auto wwc:object-cover"
					width={attachment.width}
					height={attachment.height}
				/>
			</a>
		);
	}
	return (
		<div
			aria-label={attachment.name ?? "attachment"}
			className="wwc:flex wwc:h-28 wwc:w-44 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:border wwc:bg-muted wwc:text-xs wwc:text-muted-foreground"
		>
			{attachment.name ?? "Attachment"}
		</div>
	);
}

export interface CommentThreadProps extends React.HTMLAttributes<HTMLDivElement> {
	comments: CommentItem[];
	composer?: React.ReactNode;
	composerPosition?: "top" | "bottom";
	emptyState?: React.ReactNode;
}

export function CommentThread({
	comments,
	composer,
	composerPosition = "bottom",
	emptyState,
	className,
	...rest
}: CommentThreadProps) {
	return (
		<div className={cn("wwc:flex wwc:w-full wwc:flex-col wwc:gap-4", className)} {...rest}>
			{composer && composerPosition === "top" && composer}
			{comments.length === 0
				? (emptyState ?? (
						<div className="wwc:py-8 wwc:text-center wwc:text-sm wwc:text-muted-foreground">No comments yet.</div>
					))
				: comments.map((c) => <Comment key={c.id} comment={c} />)}
			{composer && composerPosition === "bottom" && composer}
		</div>
	);
}
