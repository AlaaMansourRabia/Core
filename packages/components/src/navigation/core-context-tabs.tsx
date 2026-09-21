import {Sparkles} from "lucide-react";

import {Tabs, TabsList, TabsTrigger} from "../tabs";
import type {OrgTab, ProjectTab} from "../types";
import {ORG_TABS, PROJECT_TABS} from "../types";

interface ContextTabsProps {
	isProjectLevel: boolean;
	activeOrgTab: OrgTab;
	activeProjectTab: ProjectTab;
	onOrgTabChange: (tab: OrgTab) => void;
	onProjectTabChange: (tab: ProjectTab) => void;
}

export function ContextTabs({
	isProjectLevel,
	activeOrgTab,
	activeProjectTab,
	onOrgTabChange,
	onProjectTabChange,
}: ContextTabsProps) {
	const tabs = isProjectLevel ? PROJECT_TABS : ORG_TABS;
	const activeTab = isProjectLevel ? activeProjectTab : activeOrgTab;

	const handleTabChange = (value: string) => {
		if (isProjectLevel) {
			onProjectTabChange(value as ProjectTab);
		} else {
			onOrgTabChange(value as OrgTab);
		}
	};

	return (
		<Tabs value={activeTab} onValueChange={handleTabChange}>
			<TabsList aria-label={isProjectLevel ? "Project navigation" : "Organization navigation"}>
				{tabs.map((tab) => (
					<TabsTrigger key={tab.id} value={tab.id} className="wwc:gap-1.5">
						{tab.id === "ai-report" && (
							<Sparkles className="wwc:h-3.5 wwc:w-3.5 wwc:text-violet-500" fill="currentColor" />
						)}
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
