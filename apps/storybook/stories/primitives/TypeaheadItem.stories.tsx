import type {Meta, StoryObj} from "storybook/internal/types";

import {TypeaheadItem, TypeaheadGroup, TypeaheadEmpty} from "@core/core-ui/typeahead-item";
import {User, Building, MapPin} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Components/Primitives/TypeaheadItem",
	component: TypeaheadItem,
	tags: ["autodocs"],
} satisfies Meta<typeof TypeaheadItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [selected, setSelected] = useState<string | null>(null);
		return (
			<div className="wwc:w-64 wwc:border wwc:rounded-lg wwc:p-1 wwc:bg-background">
				<TypeaheadItem
					value="option1"
					label="Option 1"
					selected={selected === "option1"}
					onSelect={(v) => setSelected(v)}
				/>
				<TypeaheadItem
					value="option2"
					label="Option 2"
					description="With description"
					selected={selected === "option2"}
					onSelect={(v) => setSelected(v)}
				/>
				<TypeaheadItem
					value="option3"
					label="Option 3"
					selected={selected === "option3"}
					onSelect={(v) => setSelected(v)}
				/>
			</div>
		);
	},
};

export const WithIcons: Story = {
	render: () => {
		const [selected, setSelected] = useState<string | null>(null);
		return (
			<div className="wwc:w-64 wwc:border wwc:rounded-lg wwc:p-1 wwc:bg-background">
				<TypeaheadItem
					value="person"
					label="John Doe"
					description="Software Engineer"
					icon={<User className="wwc:h-4 wwc:w-4" />}
					selected={selected === "person"}
					onSelect={(v) => setSelected(v)}
				/>
				<TypeaheadItem
					value="company"
					label="Acme Corp"
					description="Technology Company"
					icon={<Building className="wwc:h-4 wwc:w-4" />}
					selected={selected === "company"}
					onSelect={(v) => setSelected(v)}
				/>
				<TypeaheadItem
					value="location"
					label="San Francisco"
					description="California, USA"
					icon={<MapPin className="wwc:h-4 wwc:w-4" />}
					selected={selected === "location"}
					onSelect={(v) => setSelected(v)}
				/>
			</div>
		);
	},
};

export const Grouped: Story = {
	render: () => {
		const [selected, setSelected] = useState<string | null>(null);
		return (
			<div className="wwc:w-64 wwc:border wwc:rounded-lg wwc:bg-background">
				<TypeaheadGroup label="People">
					<TypeaheadItem
						value="john"
						label="John Doe"
						icon={<User className="wwc:h-4 wwc:w-4" />}
						selected={selected === "john"}
						onSelect={(v) => setSelected(v)}
					/>
					<TypeaheadItem
						value="jane"
						label="Jane Smith"
						icon={<User className="wwc:h-4 wwc:w-4" />}
						selected={selected === "jane"}
						onSelect={(v) => setSelected(v)}
					/>
				</TypeaheadGroup>
				<TypeaheadGroup label="Companies">
					<TypeaheadItem
						value="acme"
						label="Acme Corp"
						icon={<Building className="wwc:h-4 wwc:w-4" />}
						selected={selected === "acme"}
						onSelect={(v) => setSelected(v)}
					/>
				</TypeaheadGroup>
			</div>
		);
	},
};

export const States: Story = {
	render: () => (
		<div className="wwc:w-64 wwc:border wwc:rounded-lg wwc:p-1 wwc:bg-background">
			<TypeaheadItem value="normal" label="Normal" />
			<TypeaheadItem value="highlighted" label="Highlighted" highlighted />
			<TypeaheadItem value="selected" label="Selected" selected />
			<TypeaheadItem value="disabled" label="Disabled" disabled />
		</div>
	),
};

export const Empty: Story = {
	render: () => (
		<div className="wwc:w-64 wwc:border wwc:rounded-lg wwc:bg-background">
			<TypeaheadEmpty>No results found for "xyz"</TypeaheadEmpty>
		</div>
	),
};
