import type {Meta, StoryObj} from "storybook/internal/types";

import {Avatar, AvatarFallback} from "@corensystem/core-ui/avatar";
import {PropertyEmpty, PropertyList, PropertyRow} from "@corensystem/core-ui/property-list";
import {
	Calendar,
	CalendarCheck,
	CircleUser,
	Component,
	Disc,
	Disc3,
	LayoutGrid,
	Signal,
	Tag,
	Users,
	X,
} from "lucide-react";

const meta = {
	title: "Components/Layout/Property List",
	component: PropertyList,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Vertical list of labeled properties for issue / work item detail panels, settings summaries, and any 'icon + label : value' stack. Renders as semantic <dl> markup. Composable — value content is fully consumer-controlled.",
			},
		},
	},
} satisfies Meta<typeof PropertyList>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- Local value renderers (mirror the screenshot exactly) ----

function StatusValue({label}: {label: string}) {
	return (
		<span className="wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:text-foreground">
			<span className="wwc:relative wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:items-center wwc:justify-center wwc:rounded-full wwc:border-2 wwc:border-amber-500">
				<span className="wwc:h-1.5 wwc:w-1.5 wwc:rounded-full wwc:bg-amber-500" />
			</span>
			{label}
		</span>
	);
}

function PriorityValue({label, bars}: {label: string; bars: 1 | 2 | 3}) {
	return (
		<span className="wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:border wwc:border-amber-200 wwc:bg-amber-50 wwc:px-2 wwc:py-1 wwc:text-xs wwc:font-medium wwc:text-amber-700">
			<span className="wwc:inline-flex wwc:items-end wwc:gap-[2px] wwc:h-3 wwc:w-3 wwc:text-amber-600">
				<span
					className={`wwc:w-[3px] wwc:rounded-sm wwc:h-[30%] ${bars >= 1 ? "wwc:bg-current" : "wwc:bg-current/30"}`}
				/>
				<span
					className={`wwc:w-[3px] wwc:rounded-sm wwc:h-[60%] ${bars >= 2 ? "wwc:bg-current" : "wwc:bg-current/30"}`}
				/>
				<span
					className={`wwc:w-[3px] wwc:rounded-sm wwc:h-[90%] ${bars >= 3 ? "wwc:bg-current" : "wwc:bg-current/30"}`}
				/>
			</span>
			{label}
		</span>
	);
}

function PersonValue({name}: {name: string}) {
	return (
		<span className="wwc:inline-flex wwc:items-center wwc:gap-2">
			<Avatar className="wwc:h-5 wwc:w-5">
				<AvatarFallback className="wwc:bg-emerald-500 wwc:text-[10px] wwc:font-medium wwc:text-white">
					{name.charAt(0).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<span className="wwc:text-foreground">{name}</span>
		</span>
	);
}

function ParentChip({id}: {id: string}) {
	return (
		<span className="wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:bg-emerald-50 wwc:px-2 wwc:py-1 wwc:text-xs wwc:font-medium wwc:text-emerald-700">
			{id}
			<button
				type="button"
				className="wwc:ml-0.5 wwc:rounded-sm wwc:opacity-70 wwc:hover:opacity-100"
				aria-label={`Remove ${id}`}
			>
				<X className="wwc:h-3 wwc:w-3" />
			</button>
		</span>
	);
}

function LabelChip({name, dotClass}: {name: string; dotClass: string}) {
	return (
		<span className="wwc:inline-flex wwc:h-7 wwc:items-center wwc:gap-1.5 wwc:rounded-full wwc:border wwc:border-border wwc:bg-background wwc:px-2 wwc:text-xs wwc:text-foreground">
			<span className={`wwc:h-2 wwc:w-2 wwc:rounded-full ${dotClass}`} />
			{name}
			<button
				type="button"
				className="wwc:ml-0.5 wwc:rounded-sm wwc:opacity-60 wwc:hover:opacity-100"
				aria-label={`Remove ${name}`}
			>
				<X className="wwc:h-3 wwc:w-3" />
			</button>
		</span>
	);
}

function AddLabelChip() {
	return (
		<button
			type="button"
			className="wwc:inline-flex wwc:h-7 wwc:items-center wwc:gap-1.5 wwc:rounded-full wwc:border wwc:border-border wwc:bg-background wwc:px-2 wwc:text-xs wwc:text-muted-foreground wwc:hover:bg-accent/40"
		>
			<Tag className="wwc:h-3 wwc:w-3" />
			Select label
		</button>
	);
}

// ---- Stories ----

export const Default: Story = {
	render: () => (
		<div className="wwc:max-w-md wwc:rounded-xl wwc:border wwc:border-border wwc:bg-background wwc:p-6">
			<PropertyList title="Properties">
				<PropertyRow icon={<Disc className="wwc:h-4 wwc:w-4" />} label="State">
					<StatusValue label="In Progress" />
				</PropertyRow>
				<PropertyRow icon={<Users className="wwc:h-4 wwc:w-4" />} label="Assignees">
					<PersonValue name="samlee.mobbin+1" />
				</PropertyRow>
				<PropertyRow icon={<Signal className="wwc:h-4 wwc:w-4" />} label="Priority">
					<PriorityValue label="High" bars={3} />
				</PropertyRow>
				<PropertyRow icon={<CircleUser className="wwc:h-4 wwc:w-4" />} label="Created by">
					<PersonValue name="samlee.mobbin+1" />
				</PropertyRow>
				<PropertyRow icon={<Calendar className="wwc:h-4 wwc:w-4" />} label="Start date">
					<span className="wwc:text-foreground">Aug 14, 2025</span>
				</PropertyRow>
				<PropertyRow icon={<CalendarCheck className="wwc:h-4 wwc:w-4" />} label="Due date">
					<span className="wwc:text-foreground">Aug 28, 2025</span>
				</PropertyRow>
				<PropertyRow icon={<LayoutGrid className="wwc:h-4 wwc:w-4" />} label="Modules">
					<PropertyEmpty>No module</PropertyEmpty>
				</PropertyRow>
				<PropertyRow icon={<Disc3 className="wwc:h-4 wwc:w-4" />} label="Cycle">
					<PropertyEmpty>No cycle</PropertyEmpty>
				</PropertyRow>
				<PropertyRow icon={<Component className="wwc:h-4 wwc:w-4" />} label="Parent">
					<ParentChip id="ASMOB-5" />
				</PropertyRow>
				<PropertyRow icon={<Tag className="wwc:h-4 wwc:w-4" />} label="Labels" align="start">
					<LabelChip name="admin" dotClass="wwc:bg-sky-500" />
					<AddLabelChip />
				</PropertyRow>
			</PropertyList>
		</div>
	),
};

export const WithoutTitle: Story = {
	render: () => (
		<div className="wwc:max-w-md wwc:rounded-xl wwc:border wwc:border-border wwc:bg-background wwc:p-6">
			<PropertyList>
				<PropertyRow icon={<Calendar className="wwc:h-4 wwc:w-4" />} label="Start date">
					<span className="wwc:text-foreground">Aug 14, 2025</span>
				</PropertyRow>
				<PropertyRow icon={<CalendarCheck className="wwc:h-4 wwc:w-4" />} label="Due date">
					<span className="wwc:text-foreground">Aug 28, 2025</span>
				</PropertyRow>
			</PropertyList>
		</div>
	),
};

export const CustomLabelWidth: Story = {
	render: () => (
		<div className="wwc:max-w-lg wwc:rounded-xl wwc:border wwc:border-border wwc:bg-background wwc:p-6">
			<PropertyList title="Build configuration" labelWidth="13rem">
				<PropertyRow label="Storybook port">
					<span className="wwc:font-mono">6007</span>
				</PropertyRow>
				<PropertyRow label="Vite dev port">
					<span className="wwc:font-mono">5173</span>
				</PropertyRow>
				<PropertyRow label="Tailwind prefix">
					<span className="wwc:font-mono">wwc:</span>
				</PropertyRow>
			</PropertyList>
		</div>
	),
};

export const EmptyValues: Story = {
	render: () => (
		<div className="wwc:max-w-md wwc:rounded-xl wwc:border wwc:border-border wwc:bg-background wwc:p-6">
			<PropertyList title="Properties">
				<PropertyRow icon={<Disc className="wwc:h-4 wwc:w-4" />} label="State">
					<PropertyEmpty>No state</PropertyEmpty>
				</PropertyRow>
				<PropertyRow icon={<Users className="wwc:h-4 wwc:w-4" />} label="Assignees">
					<PropertyEmpty>Unassigned</PropertyEmpty>
				</PropertyRow>
				<PropertyRow icon={<LayoutGrid className="wwc:h-4 wwc:w-4" />} label="Modules">
					<PropertyEmpty>No module</PropertyEmpty>
				</PropertyRow>
				<PropertyRow icon={<Disc3 className="wwc:h-4 wwc:w-4" />} label="Cycle">
					<PropertyEmpty>No cycle</PropertyEmpty>
				</PropertyRow>
			</PropertyList>
		</div>
	),
};
