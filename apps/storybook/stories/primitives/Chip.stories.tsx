import type {Meta, StoryObj} from "storybook/internal/types";

import {Chip} from "@wakecap/core-ui/chip";
import {AtSign, Calendar, FileSpreadsheet, FileText, MapPin, Star, Tag, X} from "lucide-react";
import {useState} from "react";
import {expect, userEvent, within} from "storybook/test";

const meta = {
	title: "Components/Primitives/Chip",
	component: Chip,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "default", "lg"],
		},
		showCheck: {control: "boolean"},
		disabled: {control: "boolean"},
		defaultPressed: {control: "boolean"},
	},
	args: {
		children: "Filter",
		size: "default",
		showCheck: true,
		disabled: false,
		defaultPressed: false,
	},
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
	args: {defaultPressed: true, children: "Selected"},
};

export const Small: Story = {
	args: {size: "sm", children: "Small"},
};

export const Large: Story = {
	args: {size: "lg", children: "Large"},
};

export const Disabled: Story = {
	args: {disabled: true, children: "Disabled"},
};

export const DisabledSelected: Story = {
	args: {disabled: true, defaultPressed: true, children: "Disabled selected"},
};

export const NoCheckmark: Story = {
	args: {showCheck: false, defaultPressed: true, children: "No check"},
};

export const CustomLeadingIcon: Story = {
	args: {
		leadingIcon: <MapPin className="wwc:h-3.5 wwc:w-3.5" />,
		defaultPressed: true,
		children: "Location",
	},
};

export const WithTrailingIcon: Story = {
	args: {
		defaultPressed: true,
		trailingIcon: <X className="wwc:h-3.5 wwc:w-3.5" />,
		children: "frontend",
	},
};

export const AllSizes: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
			<Chip size="sm" defaultPressed>
				Small
			</Chip>
			<Chip size="default" defaultPressed>
				Default
			</Chip>
			<Chip size="lg" defaultPressed>
				Large
			</Chip>
		</div>
	),
};

export const AllStates: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
			<Chip>Unselected</Chip>
			<Chip defaultPressed>Selected</Chip>
			<Chip disabled>Disabled</Chip>
			<Chip disabled defaultPressed>
				Disabled selected
			</Chip>
		</div>
	),
};

export const WithLeadingIcons: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
			<Chip leadingIcon={<MapPin className="wwc:h-3.5 wwc:w-3.5" />} defaultPressed>
				Location
			</Chip>
			<Chip leadingIcon={<Calendar className="wwc:h-3.5 wwc:w-3.5" />}>Date</Chip>
			<Chip leadingIcon={<Star className="wwc:h-3.5 wwc:w-3.5" />} defaultPressed>
				Favorite
			</Chip>
			<Chip leadingIcon={<Tag className="wwc:h-3.5 wwc:w-3.5" />}>Tag</Chip>
		</div>
	),
};

export const FilterChipGroup: Story = {
	render: () => {
		function FilterDemo() {
			const [filters, setFilters] = useState([
				{label: "All", active: true},
				{label: "Active", active: false},
				{label: "Archived", active: false},
				{label: "Draft", active: false},
			]);
			return (
				<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
					{filters.map((filter, i) => (
						<Chip
							key={filter.label}
							pressed={filter.active}
							onPressedChange={() =>
								setFilters((prev) => prev.map((f, idx) => (idx === i ? {...f, active: !f.active} : f)))
							}
						>
							{filter.label}
						</Chip>
					))}
				</div>
			);
		}
		return <FilterDemo />;
	},
};

export const RemovableTags: Story = {
	render: () => {
		function TagDemo() {
			const [tags, setTags] = useState<Set<string>>(new Set(["frontend", "design"]));
			const toggle = (tag: string) =>
				setTags((prev) => {
					const next = new Set(prev);
					if (next.has(tag)) next.delete(tag);
					else next.add(tag);
					return next;
				});
			return (
				<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
					{["frontend", "backend", "design", "product", "qa"].map((tag) => (
						<Chip
							key={tag}
							pressed={tags.has(tag)}
							onPressedChange={() => toggle(tag)}
							trailingIcon={tags.has(tag) ? <X className="wwc:h-3.5 wwc:w-3.5" /> : undefined}
						>
							{tag}
						</Chip>
					))}
				</div>
			);
		}
		return <TagDemo />;
	},
};

export const ToggleInteraction: Story = {
	args: {children: "Toggle me"},
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const chip = canvas.getByRole("button");

		await expect(chip).toHaveAttribute("aria-pressed", "false");
		await userEvent.click(chip);
		await expect(chip).toHaveAttribute("aria-pressed", "true");
		await userEvent.click(chip);
		await expect(chip).toHaveAttribute("aria-pressed", "false");
	},
};

// --- Attachment variant ---

export const AttachmentDefault: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
			<Chip variant="attachment" leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />} onRemove={() => {}}>
				Weekly progress report.pdf
			</Chip>
			<Chip variant="attachment" leadingIcon={<AtSign className="wwc:h-3 wwc:w-3" />} onRemove={() => {}}>
				Project schedule
			</Chip>
			<Chip variant="attachment" leadingIcon={<FileSpreadsheet className="wwc:h-3 wwc:w-3" />} onRemove={() => {}}>
				Cost budget Q3.xlsx
			</Chip>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Static rounded chips for displaying attached files or context items. Pass `onRemove` for a trailing X button.",
			},
		},
	},
};

export const AttachmentStatic: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
			<Chip variant="attachment" leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />}>
				spec.md
			</Chip>
			<Chip variant="attachment" leadingIcon={<AtSign className="wwc:h-3 wwc:w-3" />}>
				Project schedule
			</Chip>
			<Chip variant="attachment" leadingIcon={<FileSpreadsheet className="wwc:h-3 wwc:w-3" />}>
				budget.xlsx
			</Chip>
		</div>
	),
	parameters: {
		docs: {
			description: {story: "Without `onRemove`, the chip is purely a label."},
		},
	},
};

export const AttachmentSizes: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
			<Chip variant="attachment" size="sm" leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />} onRemove={() => {}}>
				Small
			</Chip>
			<Chip variant="attachment" leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />} onRemove={() => {}}>
				Default
			</Chip>
			<Chip variant="attachment" size="lg" leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />} onRemove={() => {}}>
				Large
			</Chip>
		</div>
	),
};

export const AttachmentInteractive: Story = {
	render: () => {
		function AttachmentDemo() {
			const [items, setItems] = useState([
				{id: "a1", label: "Weekly progress report.pdf", icon: <FileText className="wwc:h-3 wwc:w-3" />},
				{id: "a2", label: "Project schedule", icon: <AtSign className="wwc:h-3 wwc:w-3" />},
				{id: "a3", label: "Cost budget Q3.xlsx", icon: <FileSpreadsheet className="wwc:h-3 wwc:w-3" />},
			]);
			return (
				<div className="wwc:flex wwc:flex-col wwc:gap-3">
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
						{items.map((item) => (
							<Chip
								key={item.id}
								variant="attachment"
								leadingIcon={item.icon}
								onRemove={() => setItems((prev) => prev.filter((a) => a.id !== item.id))}
								removeLabel={`Remove ${item.label}`}
							>
								{item.label}
							</Chip>
						))}
					</div>
					{items.length === 0 && (
						<button
							type="button"
							className="wwc:self-start wwc:text-xs wwc:text-muted-foreground wwc:underline"
							onClick={() =>
								setItems([
									{id: "a1", label: "Weekly progress report.pdf", icon: <FileText className="wwc:h-3 wwc:w-3" />},
									{id: "a2", label: "Project schedule", icon: <AtSign className="wwc:h-3 wwc:w-3" />},
									{id: "a3", label: "Cost budget Q3.xlsx", icon: <FileSpreadsheet className="wwc:h-3 wwc:w-3" />},
								])
							}
						>
							Reset
						</button>
					)}
				</div>
			);
		}
		return <AttachmentDemo />;
	},
};

export const AttachmentImagePreview: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
			<Chip
				variant="attachment"
				leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />}
				preview={{
					type: "image",
					src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=600&q=80",
					alt: "Architectural concrete building",
				}}
			>
				building-elevation.jpg
			</Chip>
			<Chip
				variant="attachment"
				leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />}
				preview={{
					type: "image",
					src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80",
					alt: "Construction site overview",
				}}
			>
				site-overview.jpg
			</Chip>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Hover over a chip to see a fixed-size image preview. Images use object-cover to scale to fill.",
			},
		},
	},
};

export const AttachmentCustomPreview: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
			<Chip
				variant="attachment"
				leadingIcon={<FileSpreadsheet className="wwc:h-3 wwc:w-3" />}
				preview={{
					type: "custom",
					content: (
						<div className="wwc:flex wwc:flex-col wwc:gap-1 wwc:font-mono wwc:text-[10px] wwc:text-foreground">
							<span>Q3 Costs · 124 rows</span>
							<span className="wwc:text-muted-foreground">Labor · $1.2M</span>
							<span className="wwc:text-muted-foreground">Materials · $3.4M</span>
							<span className="wwc:text-muted-foreground">Equipment · $0.8M</span>
						</div>
					),
				}}
			>
				cost-budget-q3.xlsx
			</Chip>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Custom preview content can be any ReactNode (e.g. summary stats, code excerpts).",
			},
		},
	},
};
