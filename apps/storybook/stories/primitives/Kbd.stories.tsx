import type {Meta, StoryObj} from "storybook/internal/types";

import {Kbd} from "@core/core-ui/kbd";

const meta = {
	title: "Components/Primitives/Kbd",
	component: Kbd,
	tags: ["autodocs"],
	args: {
		children: "K",
	},
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleKey: Story = {
	args: {children: "Enter"},
};

export const ShortcutCombo: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-1">
			<Kbd>Ctrl</Kbd>
			<span className="wwc:text-sm wwc:text-muted-foreground">+</span>
			<Kbd>C</Kbd>
		</div>
	),
};

export const MultipleShortcuts: Story = {
	render: () => (
		<div className="wwc:space-y-2">
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-8">
				<span className="wwc:text-sm">Copy</span>
				<div className="wwc:flex wwc:items-center wwc:gap-1">
					<Kbd>Ctrl</Kbd>
					<span className="wwc:text-sm wwc:text-muted-foreground">+</span>
					<Kbd>C</Kbd>
				</div>
			</div>
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-8">
				<span className="wwc:text-sm">Paste</span>
				<div className="wwc:flex wwc:items-center wwc:gap-1">
					<Kbd>Ctrl</Kbd>
					<span className="wwc:text-sm wwc:text-muted-foreground">+</span>
					<Kbd>V</Kbd>
				</div>
			</div>
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-8">
				<span className="wwc:text-sm">Undo</span>
				<div className="wwc:flex wwc:items-center wwc:gap-1">
					<Kbd>Ctrl</Kbd>
					<span className="wwc:text-sm wwc:text-muted-foreground">+</span>
					<Kbd>Z</Kbd>
				</div>
			</div>
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-8">
				<span className="wwc:text-sm">Save</span>
				<div className="wwc:flex wwc:items-center wwc:gap-1">
					<Kbd>Ctrl</Kbd>
					<span className="wwc:text-sm wwc:text-muted-foreground">+</span>
					<Kbd>S</Kbd>
				</div>
			</div>
		</div>
	),
};

export const SpecialKeys: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
			<Kbd>Esc</Kbd>
			<Kbd>Tab</Kbd>
			<Kbd>Space</Kbd>
			<Kbd>Enter</Kbd>
			<Kbd>Shift</Kbd>
			<Kbd>Alt</Kbd>
			<Kbd>Ctrl</Kbd>
		</div>
	),
};
