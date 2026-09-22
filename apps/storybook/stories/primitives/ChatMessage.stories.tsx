import type {Meta, StoryObj} from "storybook/internal/types";

import {ChatMessage, ChatMessageMetadata, ChatSystemMessage} from "@corensystem/core-ui/chat-message";

const meta = {
	title: "Components/Primitives/ChatMessage",
	component: ChatMessage,
	tags: ["autodocs"],
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:max-w-xl wwc:space-y-2">
			<ChatMessage variant="user" avatar="https://github.com/shadcn.png" avatarFallback="JD">
				Hello! How can I help you today?
			</ChatMessage>
			<ChatMessage variant="assistant" avatarFallback="AI">
				Hi there! I'm here to assist you with any questions you might have.
			</ChatMessage>
		</div>
	),
};

export const Conversation: Story = {
	render: () => (
		<div className="wwc:max-w-xl wwc:space-y-2">
			<ChatMessage variant="user" avatarFallback="JD" timestamp={new Date()}>
				What's the weather like today?
			</ChatMessage>
			<ChatMessage variant="assistant" avatarFallback="AI" timestamp={new Date()}>
				I don't have access to real-time weather data, but I can help you find weather information if you tell me your
				location!
			</ChatMessage>
			<ChatMessage variant="user" avatarFallback="JD" timestamp={new Date()}>
				I'm in San Francisco.
			</ChatMessage>
			<ChatMessage variant="assistant" avatarFallback="AI" timestamp={new Date()}>
				San Francisco typically has mild weather year-round. The average temperature ranges from 50-65°F. You can check
				the current conditions at weather.gov or a weather app.
			</ChatMessage>
		</div>
	),
};

export const Streaming: Story = {
	render: () => (
		<div className="wwc:max-w-xl">
			<ChatMessage variant="assistant" avatarFallback="AI" isStreaming>
				I'm currently thinking about your request
			</ChatMessage>
		</div>
	),
};

export const WithoutAvatar: Story = {
	render: () => (
		<div className="wwc:max-w-xl wwc:space-y-2">
			<ChatMessage variant="user" showAvatar={false}>
				Message without avatar
			</ChatMessage>
			<ChatMessage variant="assistant" showAvatar={false}>
				Response without avatar
			</ChatMessage>
		</div>
	),
};

export const SystemMessage: Story = {
	render: () => (
		<div className="wwc:max-w-xl wwc:space-y-2">
			<ChatSystemMessage>User joined the conversation</ChatSystemMessage>
			<ChatMessage variant="user" avatarFallback="JD">
				Hi everyone!
			</ChatMessage>
			<ChatSystemMessage>Agent is typing...</ChatSystemMessage>
		</div>
	),
};

export const WithMetadata: Story = {
	render: () => (
		<div className="wwc:max-w-xl wwc:space-y-4">
			<div>
				<ChatMessage variant="assistant" avatarFallback="AI">
					Here's a detailed response to your question about machine learning algorithms.
				</ChatMessage>
				<div className="wwc:pl-11 wwc:pt-1">
					<ChatMessageMetadata label="Model">GPT-4</ChatMessageMetadata>
					<ChatMessageMetadata label="Tokens">245 in / 512 out</ChatMessageMetadata>
				</div>
			</div>
		</div>
	),
};
