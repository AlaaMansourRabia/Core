import type {Meta, StoryObj} from "storybook/internal/types";

import {
	MultiSelect,
	SearchableSelect,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@core/core-ui/select";
import * as React from "react";
import {expect, screen, userEvent, within} from "storybook/test";

const meta = {
	title: "Components/Primitives/Select",
	component: Select,
	tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Select>
			<SelectTrigger className="wwc:w-[200px]">
				<SelectValue placeholder="Select a fruit" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="apple">Apple</SelectItem>
				<SelectItem value="banana">Banana</SelectItem>
				<SelectItem value="cherry">Cherry</SelectItem>
				<SelectItem value="grape">Grape</SelectItem>
				<SelectItem value="orange">Orange</SelectItem>
			</SelectContent>
		</Select>
	),
};

export const WithGroups: Story = {
	render: () => (
		<Select>
			<SelectTrigger className="wwc:w-[200px]">
				<SelectValue placeholder="Select a food" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Fruits</SelectLabel>
					<SelectItem value="apple">Apple</SelectItem>
					<SelectItem value="banana">Banana</SelectItem>
					<SelectItem value="cherry">Cherry</SelectItem>
				</SelectGroup>
				<SelectSeparator />
				<SelectGroup>
					<SelectLabel>Vegetables</SelectLabel>
					<SelectItem value="carrot">Carrot</SelectItem>
					<SelectItem value="broccoli">Broccoli</SelectItem>
					<SelectItem value="spinach">Spinach</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	),
};

export const WithDisabledItems: Story = {
	render: () => (
		<Select>
			<SelectTrigger className="wwc:w-[200px]">
				<SelectValue placeholder="Select an option" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="option1">Option 1</SelectItem>
				<SelectItem value="option2" disabled>
					Option 2 (disabled)
				</SelectItem>
				<SelectItem value="option3">Option 3</SelectItem>
			</SelectContent>
		</Select>
	),
};

export const Disabled: Story = {
	render: () => (
		<Select disabled>
			<SelectTrigger className="wwc:w-[200px]">
				<SelectValue placeholder="Disabled select" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="option1">Option 1</SelectItem>
			</SelectContent>
		</Select>
	),
};

const searchableOptions = [
	{value: "us", label: "United States"},
	{value: "ca", label: "Canada"},
	{value: "mx", label: "Mexico"},
	{value: "uk", label: "United Kingdom"},
	{value: "fr", label: "France"},
	{value: "de", label: "Germany"},
	{value: "jp", label: "Japan"},
	{value: "au", label: "Australia"},
	{value: "br", label: "Brazil"},
	{value: "in", label: "India"},
];

export const Searchable: Story = {
	render: () => {
		const [value, setValue] = React.useState("");
		return (
			<SearchableSelect
				options={searchableOptions}
				value={value}
				onValueChange={setValue}
				placeholder="Select a country"
				className="wwc:w-[200px]"
			/>
		);
	},
};

export const SearchableDisabled: Story = {
	render: () => (
		<SearchableSelect
			options={searchableOptions}
			placeholder="Disabled searchable"
			className="wwc:w-[200px]"
			disabled
		/>
	),
};

const multiSelectOptions = [
	{value: "react", label: "React"},
	{value: "vue", label: "Vue"},
	{value: "angular", label: "Angular"},
	{value: "svelte", label: "Svelte"},
	{value: "solid", label: "SolidJS"},
	{value: "qwik", label: "Qwik"},
];

export const Multi: Story = {
	render: () => {
		const [value, setValue] = React.useState<string[]>([]);
		return (
			<MultiSelect
				options={multiSelectOptions}
				value={value}
				onValueChange={setValue}
				placeholder="Select frameworks"
				className="wwc:w-[300px]"
			/>
		);
	},
};

export const MultiWithTags: Story = {
	render: () => (
		<MultiSelect
			options={multiSelectOptions}
			placeholder="Select frameworks"
			className="wwc:w-[300px]"
			showTags
			value={["react", "vue", "angular"]}
		/>
	),
};

export const MultiDisabled: Story = {
	render: () => (
		<MultiSelect options={multiSelectOptions} placeholder="Disabled multi" className="wwc:w-[300px]" disabled />
	),
};

export const SearchableSmall: Story = {
	render: () => {
		const [value, setValue] = React.useState("");
		return (
			<SearchableSelect
				options={searchableOptions}
				value={value}
				onValueChange={setValue}
				placeholder="Select a country"
				className="wwc:w-[160px]"
				size="sm"
			/>
		);
	},
};

export const MultiSmall: Story = {
	render: () => {
		const [value, setValue] = React.useState<string[]>([]);
		return (
			<MultiSelect
				options={multiSelectOptions}
				value={value}
				onValueChange={setValue}
				placeholder="Select frameworks"
				className="wwc:w-[200px]"
				size="sm"
			/>
		);
	},
};

export const MultiWithTagsSmall: Story = {
	render: () => (
		<MultiSelect
			options={multiSelectOptions}
			placeholder="Select frameworks"
			className="wwc:w-[300px]"
			showTags
			size="sm"
			value={["react", "vue", "angular"]}
		/>
	),
};

export const MultiKeepPlaceholder: Story = {
	render: () => (
		<MultiSelect
			options={multiSelectOptions}
			placeholder="Frameworks"
			className="wwc:w-[200px]"
			keepPlaceholder
			value={["react", "vue"]}
		/>
	),
};

export const SizeComparison: Story = {
	render: () => {
		const [country, setCountry] = React.useState("");
		const [countrySm, setCountrySm] = React.useState("");
		const [frameworks, setFrameworks] = React.useState<string[]>([]);
		const [frameworksSm, setFrameworksSm] = React.useState<string[]>([]);
		return (
			<div className="wwc:flex wwc:flex-col wwc:gap-4">
				<div className="wwc:flex wwc:items-center wwc:gap-4">
					<span className="wwc:text-sm wwc:text-muted-foreground wwc:w-16">Default</span>
					<SearchableSelect
						options={searchableOptions}
						value={country}
						onValueChange={setCountry}
						placeholder="Country"
						className="wwc:w-[200px]"
					/>
					<MultiSelect
						options={multiSelectOptions}
						value={frameworks}
						onValueChange={setFrameworks}
						placeholder="Frameworks"
						className="wwc:w-[200px]"
						keepPlaceholder
					/>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-4">
					<span className="wwc:text-sm wwc:text-muted-foreground wwc:w-16">Small</span>
					<SearchableSelect
						options={searchableOptions}
						value={countrySm}
						onValueChange={setCountrySm}
						placeholder="Country"
						className="wwc:w-[200px]"
						size="sm"
					/>
					<MultiSelect
						options={multiSelectOptions}
						value={frameworksSm}
						onValueChange={setFrameworksSm}
						placeholder="Frameworks"
						className="wwc:w-[200px]"
						size="sm"
						keepPlaceholder
					/>
				</div>
			</div>
		);
	},
};

export const OpenInteraction: Story = {
	render: () => (
		<Select>
			<SelectTrigger className="wwc:w-[200px]">
				<SelectValue placeholder="Choose..." />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="apple">Apple</SelectItem>
				<SelectItem value="banana">Banana</SelectItem>
				<SelectItem value="cherry">Cherry</SelectItem>
			</SelectContent>
		</Select>
	),
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("combobox");

		await userEvent.click(trigger);
		const option = await screen.findByRole("option", {name: /banana/i});
		await userEvent.click(option);
	},
};
