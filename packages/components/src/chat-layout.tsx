import {cn} from "@corensystem/coren-utils";
import * as React from "react";

export interface ChatLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Fixed header content (e.g., chat title, actions) */
	header?: React.ReactNode;
	/** Fixed footer content (e.g., composer) */
	footer?: React.ReactNode;
	/** Sidebar content */
	sidebar?: React.ReactNode;
	/** Sidebar position */
	sidebarPosition?: "left" | "right";
	/** Sidebar width */
	sidebarWidth?: string;
}

/** Layout container for chat interfaces with header, scrollable messages, and footer. */
const ChatLayout = React.forwardRef<HTMLDivElement, ChatLayoutProps>(
	({className, header, footer, sidebar, sidebarPosition = "left", sidebarWidth = "280px", children, ...props}, ref) => (
		<div ref={ref} className={cn("wwc:flex wwc:h-full wwc:w-full", className)} {...props}>
			{sidebar && sidebarPosition === "left" && (
				<div
					className="wwc:flex-shrink-0 wwc:border-r wwc:border-border wwc:overflow-y-auto"
					style={{width: sidebarWidth}}
				>
					{sidebar}
				</div>
			)}
			<div className="wwc:flex wwc:flex-1 wwc:flex-col wwc:min-w-0">
				{header && <div className="wwc:flex-shrink-0 wwc:border-b wwc:border-border">{header}</div>}
				<div className="wwc:flex-1 wwc:overflow-y-auto">{children}</div>
				{footer && <div className="wwc:flex-shrink-0 wwc:border-t wwc:border-border">{footer}</div>}
			</div>
			{sidebar && sidebarPosition === "right" && (
				<div
					className="wwc:flex-shrink-0 wwc:border-l wwc:border-border wwc:overflow-y-auto"
					style={{width: sidebarWidth}}
				>
					{sidebar}
				</div>
			)}
		</div>
	),
);
ChatLayout.displayName = "ChatLayout";

export interface ChatMessagesContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Auto-scroll to bottom on new messages */
	autoScroll?: boolean;
}

/** Scrollable container for chat messages with auto-scroll support. */
const ChatMessagesContainer = React.forwardRef<HTMLDivElement, ChatMessagesContainerProps>(
	({className, autoScroll = true, children, ...props}, ref) => {
		const containerRef = React.useRef<HTMLDivElement>(null);

		React.useEffect(() => {
			if (autoScroll && containerRef.current) {
				containerRef.current.scrollTop = containerRef.current.scrollHeight;
			}
		}, [children, autoScroll]);

		return (
			<div
				ref={(node) => {
					(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
					if (typeof ref === "function") ref(node);
					else if (ref) ref.current = node;
				}}
				className={cn("wwc:flex wwc:flex-col wwc:px-4 wwc:overflow-y-auto", className)}
				{...props}
			>
				{children}
			</div>
		);
	},
);
ChatMessagesContainer.displayName = "ChatMessagesContainer";

export interface ChatHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** Title of the chat */
	title?: React.ReactNode;
	/** Subtitle or status */
	subtitle?: React.ReactNode;
	/** Actions on the right side */
	actions?: React.ReactNode;
}

/** Header component for chat interfaces. */
const ChatHeader = React.forwardRef<HTMLDivElement, ChatHeaderProps>(
	({className, title, subtitle, actions, children, ...props}, ref) => (
		<div
			ref={ref}
			className={cn("wwc:flex wwc:items-center wwc:justify-between wwc:px-4 wwc:py-3", className)}
			{...props}
		>
			<div className="wwc:flex wwc:flex-col wwc:min-w-0">
				{title && <h2 className="wwc:font-semibold wwc:text-foreground wwc:truncate">{title}</h2>}
				{subtitle && <p className="wwc:text-sm wwc:text-muted-foreground wwc:truncate">{subtitle}</p>}
				{children}
			</div>
			{actions && <div className="wwc:flex wwc:items-center wwc:gap-2 wwc:ml-4">{actions}</div>}
		</div>
	),
);
ChatHeader.displayName = "ChatHeader";

export interface ChatFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Footer component for chat interfaces (typically contains composer). */
const ChatFooter = React.forwardRef<HTMLDivElement, ChatFooterProps>(({className, children, ...props}, ref) => (
	<div ref={ref} className={cn("wwc:px-4 wwc:py-3", className)} {...props}>
		{children}
	</div>
));
ChatFooter.displayName = "ChatFooter";

export {ChatLayout, ChatMessagesContainer, ChatHeader, ChatFooter};
