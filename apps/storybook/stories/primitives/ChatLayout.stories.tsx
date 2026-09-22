import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/core-ui/button";
import {ChatLayout, ChatHeader, ChatFooter, ChatMessagesContainer} from "@corensystem/core-ui/chat-layout";
import {ChatMessage, ChatSystemMessage} from "@corensystem/core-ui/chat-message";
import {Input} from "@corensystem/core-ui/input";
import {MoreHorizontal, Phone, Video} from "lucide-react";

const meta = {
	title: "Components/Primitives/ChatLayout",
	component: ChatLayout,
	tags: ["autodocs"],
} satisfies Meta<typeof ChatLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-[500px] wwc:border wwc:rounded-lg wwc:overflow-hidden">
			<ChatLayout
				header={
					<ChatHeader
						title="Support Chat"
						subtitle="Online"
						actions={
							<>
								<Button variant="ghost" size="sm" className="wwc:h-8 wwc:w-8 wwc:p-0">
									<Phone className="wwc:h-4 wwc:w-4" />
								</Button>
								<Button variant="ghost" size="sm" className="wwc:h-8 wwc:w-8 wwc:p-0">
									<Video className="wwc:h-4 wwc:w-4" />
								</Button>
								<Button variant="ghost" size="sm" className="wwc:h-8 wwc:w-8 wwc:p-0">
									<MoreHorizontal className="wwc:h-4 wwc:w-4" />
								</Button>
							</>
						}
					/>
				}
				footer={
					<ChatFooter>
						<div className="wwc:flex wwc:gap-2">
							<Input placeholder="Type a message..." className="wwc:flex-1" />
							<Button>Send</Button>
						</div>
					</ChatFooter>
				}
			>
				<ChatMessagesContainer>
					<ChatSystemMessage>Conversation started</ChatSystemMessage>
					<ChatMessage variant="assistant" avatarFallback="AI">
						Hello! How can I help you today?
					</ChatMessage>
					<ChatMessage variant="user" avatarFallback="JD">
						I have a question about my order.
					</ChatMessage>
					<ChatMessage variant="assistant" avatarFallback="AI">
						Of course! I'd be happy to help. Could you please provide your order number?
					</ChatMessage>
				</ChatMessagesContainer>
			</ChatLayout>
		</div>
	),
};

export const WithSidebar: Story = {
	render: () => (
		<div className="wwc:h-[500px] wwc:border wwc:rounded-lg wwc:overflow-hidden">
			<ChatLayout
				sidebar={
					<div className="wwc:p-4">
						<h3 className="wwc:font-semibold wwc:mb-4">Conversations</h3>
						<div className="wwc:space-y-2">
							{["Support Chat", "Sales Team", "Product Help"].map((name) => (
								<div key={name} className="wwc:p-2 wwc:rounded wwc:hover:bg-accent wwc:cursor-pointer">
									{name}
								</div>
							))}
						</div>
					</div>
				}
				sidebarPosition="left"
				header={<ChatHeader title="Support Chat" subtitle="3 members" />}
				footer={
					<ChatFooter>
						<div className="wwc:flex wwc:gap-2">
							<Input placeholder="Type a message..." className="wwc:flex-1" />
							<Button>Send</Button>
						</div>
					</ChatFooter>
				}
			>
				<ChatMessagesContainer>
					<ChatMessage variant="assistant" avatarFallback="AI">
						Welcome to Support Chat!
					</ChatMessage>
				</ChatMessagesContainer>
			</ChatLayout>
		</div>
	),
};

export const MinimalChat: Story = {
	render: () => (
		<div className="wwc:h-[400px] wwc:border wwc:rounded-lg wwc:overflow-hidden">
			<ChatLayout
				footer={
					<ChatFooter>
						<div className="wwc:flex wwc:gap-2">
							<Input placeholder="Ask anything..." className="wwc:flex-1" />
							<Button>Send</Button>
						</div>
					</ChatFooter>
				}
			>
				<ChatMessagesContainer className="wwc:py-4">
					<ChatMessage variant="assistant" avatarFallback="AI" showAvatar={false}>
						Hello! I'm your AI assistant. How can I help you today?
					</ChatMessage>
				</ChatMessagesContainer>
			</ChatLayout>
		</div>
	),
};
