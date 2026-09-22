import type {TabItem} from "@corensystem/core-ui/tab-list";
import type {Meta, StoryObj} from "storybook/internal/types";

import {TabList} from "@corensystem/core-ui/tab-list";
import {Home, Settings, User, Bell} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Components/Primitives/TabList",
	component: TabList,
	tags: ["autodocs"],
} satisfies Meta<typeof TabList>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems: TabItem[] = [
	{value: "overview", label: "Overview"},
	{value: "analytics", label: "Analytics"},
	{value: "reports", label: "Reports"},
	{value: "notifications", label: "Notifications"},
];

export const Default: Story = {
	render: () => {
		const [value, setValue] = useState("overview");
		return <TabList items={basicItems} value={value} onChange={setValue} />;
	},
};

export const Variants: Story = {
	render: () => {
		const [value1, setValue1] = useState("overview");
		const [value2, setValue2] = useState("overview");
		const [value3, setValue3] = useState("overview");
		return (
			<div className="wwc:space-y-6">
				<div>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Default</p>
					<TabList variant="default" items={basicItems} value={value1} onChange={setValue1} />
				</div>
				<div>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Underline</p>
					<TabList variant="underline" items={basicItems} value={value2} onChange={setValue2} />
				</div>
				<div>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Pills</p>
					<TabList variant="pills" items={basicItems} value={value3} onChange={setValue3} />
				</div>
			</div>
		);
	},
};

export const Sizes: Story = {
	render: () => {
		const [value1, setValue1] = useState("overview");
		const [value2, setValue2] = useState("overview");
		const [value3, setValue3] = useState("overview");
		return (
			<div className="wwc:space-y-6">
				<div>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Small</p>
					<TabList size="sm" items={basicItems} value={value1} onChange={setValue1} />
				</div>
				<div>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Medium</p>
					<TabList size="md" items={basicItems} value={value2} onChange={setValue2} />
				</div>
				<div>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Large</p>
					<TabList size="lg" items={basicItems} value={value3} onChange={setValue3} />
				</div>
			</div>
		);
	},
};

export const WithIcons: Story = {
	render: () => {
		const items: TabItem[] = [
			{value: "home", label: "Home", icon: <Home className="wwc:h-4 wwc:w-4" />},
			{value: "profile", label: "Profile", icon: <User className="wwc:h-4 wwc:w-4" />},
			{value: "settings", label: "Settings", icon: <Settings className="wwc:h-4 wwc:w-4" />},
			{value: "notifications", label: "Alerts", icon: <Bell className="wwc:h-4 wwc:w-4" />},
		];
		const [value, setValue] = useState("home");
		return <TabList items={items} value={value} onChange={setValue} />;
	},
};

export const WithCounts: Story = {
	render: () => {
		const items: TabItem[] = [
			{value: "all", label: "All", count: 42},
			{value: "pending", label: "Pending", count: 12},
			{value: "completed", label: "Completed", count: 28},
			{value: "archived", label: "Archived", count: 2},
		];
		const [value, setValue] = useState("all");
		return <TabList items={items} value={value} onChange={setValue} />;
	},
};

export const WithDisabled: Story = {
	render: () => {
		const items: TabItem[] = [
			{value: "active", label: "Active"},
			{value: "disabled", label: "Disabled", disabled: true},
			{value: "another", label: "Another"},
		];
		const [value, setValue] = useState("active");
		return <TabList items={items} value={value} onChange={setValue} />;
	},
};
