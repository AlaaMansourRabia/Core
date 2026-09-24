import type {Meta, StoryObj} from "storybook/internal/types";

import {NumberInput} from "@corensystem/coren-ui/number-input";
import {useState} from "react";

const meta = {
	title: "Components/Primitives/NumberInput",
	component: NumberInput,
	tags: ["autodocs"],
} satisfies Meta<typeof meta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [value, setValue] = useState<number | undefined>(0);
		return <NumberInput value={value} onChange={setValue} />;
	},
};

export const WithMinMax: Story = {
	render: () => {
		const [value, setValue] = useState<number | undefined>(5);
		return <NumberInput value={value} onChange={setValue} min={0} max={10} />;
	},
};

export const WithStep: Story = {
	render: () => {
		const [value, setValue] = useState<number | undefined>(0);
		return <NumberInput value={value} onChange={setValue} step={5} />;
	},
};

export const Decimal: Story = {
	render: () => {
		const [value, setValue] = useState<number | undefined>(0);
		return <NumberInput value={value} onChange={setValue} step={0.1} precision={2} />;
	},
};

export const NoControls: Story = {
	render: () => {
		const [value, setValue] = useState<number | undefined>(0);
		return <NumberInput value={value} onChange={setValue} showControls={false} />;
	},
};

export const Disabled: Story = {
	render: () => <NumberInput value={42} disabled />,
};
