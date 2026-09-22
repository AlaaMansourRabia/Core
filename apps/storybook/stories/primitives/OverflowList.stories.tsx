import type {Meta, StoryObj} from "storybook/internal/types";

import {Avatar, AvatarFallback} from "@corensystem/core-ui/avatar";
import {Badge} from "@corensystem/core-ui/badge";
import {OverflowList} from "@corensystem/core-ui/overflow-list";

const meta = {
	title: "Components/Primitives/OverflowList",
	component: OverflowList,
	tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const tags = ["React", "TypeScript", "Tailwind", "Vite", "Storybook", "Vitest", "ESLint", "Prettier"];
const users = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Henry"];

export const Default: Story = {
	render: () => (
		<OverflowList items={tags} maxVisible={3} renderItem={(tag) => <Badge variant="secondary">{tag}</Badge>} />
	),
};

export const Avatars: Story = {
	render: () => (
		<OverflowList
			items={users}
			maxVisible={4}
			renderItem={(user) => (
				<Avatar size="sm">
					<AvatarFallback>{user[0]}</AvatarFallback>
				</Avatar>
			)}
		/>
	),
};

export const CustomOverflow: Story = {
	render: () => (
		<OverflowList
			items={tags}
			maxVisible={2}
			renderItem={(tag) => <Badge variant="secondary">{tag}</Badge>}
			renderOverflow={(count) => <Badge variant="outline">+{count} more tags</Badge>}
		/>
	),
};

export const MoreVisible: Story = {
	render: () => (
		<OverflowList items={tags} maxVisible={5} renderItem={(tag) => <Badge variant="secondary">{tag}</Badge>} />
	),
};
