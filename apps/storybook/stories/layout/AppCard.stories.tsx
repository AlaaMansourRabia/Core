import type {Meta, StoryObj} from "storybook/internal/types";

import {AppCard} from "@corensystem/coren-ui/app-card";
import {Badge} from "@corensystem/coren-ui/badge";
import {Button} from "@corensystem/coren-ui/button";
import {Calendar, HardHat, Plus, Users} from "lucide-react";

const meta = {
	title: "Components/Layout/Card/App Card",
	component: AppCard,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A marketplace / app-store listing card: a branded icon tile, an optional top-right status badge, a " +
					"title (which may carry a search highlight), a clamped description, and a footer action row. Purely " +
					"presentational and slot-driven — the caller supplies the icon, badge, and action buttons (typically a " +
					"Details + Install pair). Card heights stay aligned via a fixed description clamp.",
			},
		},
	},
} satisfies Meta<typeof AppCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const iconTile = (Icon: typeof Users, className: string) => (
	<span className={`wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-xl ${className}`}>
		<Icon className="wwc:h-6 wwc:w-6" />
	</span>
);

const installedBadge = (
	<Badge className="wwc:h-5 wwc:border-transparent wwc:bg-green-100 wwc:text-[10px] wwc:text-green-700">
		Installed
	</Badge>
);

const detailsInstall = (
	<>
		<Button variant="outline" size="sm" className="wwc:flex-1">
			Details
		</Button>
		<Button variant="outline" size="sm" className="wwc:flex wwc:flex-1 wwc:gap-1.5">
			<Plus className="wwc:h-3.5 wwc:w-3.5" />
			Install
		</Button>
	</>
);

export const Default: Story = {
	render: () => (
		<div className="wwc:max-w-xs">
			<AppCard
				icon={iconTile(Calendar, "wwc:bg-muted wwc:text-foreground")}
				name="Google Calendar"
				description="Google Calendar is a time management and scheduling service developed by Google. Allows users to create and edit events."
				actions={detailsInstall}
			/>
		</div>
	),
};

export const Grid: Story = {
	render: () => (
		<div className="wwc:grid wwc:max-w-3xl wwc:grid-cols-1 wwc:gap-3 wwc:sm:grid-cols-3">
			<AppCard
				icon={iconTile(Users, "wwc:bg-muted wwc:text-foreground")}
				name={
					<>
						<mark className="wwc:rounded-[3px] wwc:bg-yellow-200 wwc:text-black">Work</mark>force
					</>
				}
				description="Headcount, crews, OBS, compliance, and a live site map for your workforce."
				badge={installedBadge}
				actions={
					<>
						<Button variant="outline" size="sm" className="wwc:flex-1">
							Details
						</Button>
						<Button variant="outline" size="sm" className="wwc:flex-1 wwc:text-muted-foreground">
							Uninstall
						</Button>
					</>
				}
			/>
			<AppCard
				icon={iconTile(HardHat, "wwc:bg-muted wwc:text-foreground")}
				name="Safety Manager"
				description="Observations, incidents, and corrective actions across every site."
				actions={detailsInstall}
			/>
			<AppCard
				icon={iconTile(Calendar, "wwc:bg-muted wwc:text-foreground")}
				name="Weather Station"
				description="On-site weather, heat-stress indices, and stop-work thresholds."
				actions={detailsInstall}
			/>
		</div>
	),
};
