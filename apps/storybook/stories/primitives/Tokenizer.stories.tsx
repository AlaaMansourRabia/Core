import type {Meta, StoryObj} from "storybook/internal/types";

import {Tokenizer} from "@corensystem/coren-ui/tokenizer";
import {useState} from "react";

const meta = {
	title: "Components/Primitives/Tokenizer",
	component: Tokenizer,
	tags: ["autodocs"],
} satisfies Meta<typeof meta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [tokens, setTokens] = useState<string[]>(["React", "TypeScript", "Tailwind"]);
		return <Tokenizer value={tokens} onChange={setTokens} placeholder="Add tags..." />;
	},
};

export const EmailInput: Story = {
	render: () => {
		const [emails, setEmails] = useState<string[]>([]);
		return (
			<Tokenizer
				value={emails}
				onChange={setEmails}
				placeholder="Enter email addresses..."
				validator={(token) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(token)}
			/>
		);
	},
};

export const MaxTokens: Story = {
	render: () => {
		const [tokens, setTokens] = useState<string[]>(["Tag 1", "Tag 2"]);
		return <Tokenizer value={tokens} onChange={setTokens} max={5} placeholder="Max 5 tags..." />;
	},
};

export const AllowDuplicates: Story = {
	render: () => {
		const [tokens, setTokens] = useState<string[]>([]);
		return <Tokenizer value={tokens} onChange={setTokens} allowDuplicates placeholder="Duplicates allowed..." />;
	},
};

export const Disabled: Story = {
	render: () => {
		const [tokens] = useState<string[]>(["Disabled", "Tags"]);
		return <Tokenizer value={tokens} disabled />;
	},
};
