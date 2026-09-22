import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@core/core-ui/button";
import {MegaMenu, MegaMenuCategory} from "@core/core-ui/mega-menu";
import {Code, FileText, Layers, Settings, Users, Zap} from "lucide-react";

const meta = {
	title: "Components/Primitives/MegaMenu",
	component: MegaMenu,
	tags: ["autodocs"],
} satisfies Meta<typeof MegaMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCategories: MegaMenuCategory[] = [
	{
		label: "Products",
		featured: {
			title: "New Release",
			description: "Check out our latest product with amazing new features.",
			href: "/products/new",
		},
		sections: [
			{
				title: "Platform",
				items: [
					{
						title: "Analytics",
						description: "Measure what matters",
						href: "/products/analytics",
						icon: <Zap className="wwc:h-4 wwc:w-4" />,
					},
					{
						title: "Integrations",
						description: "Connect your tools",
						href: "/products/integrations",
						icon: <Layers className="wwc:h-4 wwc:w-4" />,
					},
				],
			},
			{
				title: "Tools",
				items: [
					{
						title: "API",
						description: "Build with our API",
						href: "/products/api",
						icon: <Code className="wwc:h-4 wwc:w-4" />,
					},
					{
						title: "SDKs",
						description: "Native integrations",
						href: "/products/sdks",
						icon: <FileText className="wwc:h-4 wwc:w-4" />,
					},
				],
			},
		],
	},
	{
		label: "Solutions",
		sections: [
			{
				items: [
					{
						title: "Enterprise",
						description: "For large organizations",
						href: "/solutions/enterprise",
						icon: <Users className="wwc:h-4 wwc:w-4" />,
					},
					{
						title: "Startups",
						description: "For growing teams",
						href: "/solutions/startups",
						icon: <Zap className="wwc:h-4 wwc:w-4" />,
					},
					{
						title: "Developers",
						description: "For individual devs",
						href: "/solutions/developers",
						icon: <Code className="wwc:h-4 wwc:w-4" />,
					},
				],
			},
		],
	},
	{
		label: "Resources",
		sections: [
			{
				title: "Learn",
				items: [
					{title: "Documentation", description: "Read our guides", href: "/docs"},
					{title: "Tutorials", description: "Step-by-step guides", href: "/tutorials"},
				],
			},
			{
				title: "Support",
				items: [
					{title: "Help Center", description: "Get help", href: "/help"},
					{title: "Community", description: "Join discussions", href: "/community"},
				],
			},
		],
	},
];

export const Default: Story = {
	render: () => (
		<MegaMenu
			categories={sampleCategories}
			logo={<span className="wwc:font-bold wwc:text-xl">Brand</span>}
			actions={
				<>
					<Button variant="ghost" size="sm">
						Sign in
					</Button>
					<Button size="sm">Get Started</Button>
				</>
			}
		/>
	),
};

export const Simple: Story = {
	render: () => {
		const simpleCategories: MegaMenuCategory[] = [
			{
				label: "Products",
				sections: [
					{
						items: [
							{title: "Feature 1", href: "/feature-1"},
							{title: "Feature 2", href: "/feature-2"},
							{title: "Feature 3", href: "/feature-3"},
						],
					},
				],
			},
			{
				label: "About",
				sections: [
					{
						items: [
							{title: "Company", href: "/company"},
							{title: "Team", href: "/team"},
							{title: "Careers", href: "/careers"},
						],
					},
				],
			},
		];
		return <MegaMenu categories={simpleCategories} logo={<span className="wwc:font-bold">Logo</span>} />;
	},
};
