import type {ReactNode} from "react";

// Chart types
export type ChartType = "bar" | "line" | "area" | "pie" | "scatter";

export interface ChartConfig {
	[key: string]: {
		label: string;
		color?: string;
	};
}

export interface ChartData {
	chartType: ChartType;
	data: Record<string, unknown>[];
	config: ChartConfig;
	xAxisKey?: string;
	dataKeys?: string[];
	stacked?: boolean;
	title?: string;
}

// Message types
export type MessageRole = "user" | "assistant";

/** A context item or file that was attached to a message when it was sent. */
export interface MessageAttachment {
	id: string;
	label: string;
	type?: "file" | "context";
	icon?: ReactNode;
	/** Secondary line, e.g. a file size or source. */
	subtitle?: string;
}

export interface BaseMessage {
	id: string;
	role: MessageRole;
	timestamp: Date;
	/** Context items and files sent alongside the message. Rendered as chips on the bubble. */
	attachments?: MessageAttachment[];
}

export interface TextMessage extends BaseMessage {
	type: "text";
	content: string;
}

export interface ChartMessage extends BaseMessage {
	type: "chart";
	content: string;
	message?: string;
	chartData: ChartData;
	chart?: ChartData;
	isAddedToPage?: boolean;
	targetTab?: string;
}

export type Message = TextMessage | ChartMessage;

// Dashboard widget types
export interface DashboardWidget {
	id: string;
	type?: "chart" | "metric" | "table";
	title: string;
	data?: ChartData | Record<string, unknown>;
	chartData?: ChartData;
	targetTab?: string;
	addedAt?: Date;
	position?: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
}
