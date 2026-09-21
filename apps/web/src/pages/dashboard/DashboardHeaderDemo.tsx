import {useState} from "react";

import {DashboardHeader} from "@/components/ui/navigation/core-dashboard-header";
import {MOCK_ORGANIZATIONS} from "@/lib/mock-data";
import type {OrgTab, Organization, Project, ProjectTab} from "@/lib/types";

export function DashboardHeaderDemo() {
	const [selectedOrg, setSelectedOrg] = useState<Organization>(MOCK_ORGANIZATIONS[0]);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [activeOrgTab, setActiveOrgTab] = useState<OrgTab>("overview");
	const [activeProjectTab, setActiveProjectTab] = useState<ProjectTab>("overview");

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Dashboard Header</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Navigation header with organization/project switcher and context tabs.
				</p>
			</div>

			<div className="wwc:border wwc:rounded-lg wwc:overflow-hidden">
				<DashboardHeader
					selectedOrg={selectedOrg}
					selectedProject={selectedProject}
					activeOrgTab={activeOrgTab}
					activeProjectTab={activeProjectTab}
					isProjectLevel={!!selectedProject}
					onSelectOrg={setSelectedOrg}
					onSelectProject={setSelectedProject}
					onOrgTabChange={setActiveOrgTab}
					onProjectTabChange={setActiveProjectTab}
				/>
			</div>

			<div className="wwc:p-4 wwc:bg-muted wwc:rounded-lg">
				<p className="wwc:text-sm">
					<strong>Selected Org:</strong> {selectedOrg.name}
				</p>
				<p className="wwc:text-sm">
					<strong>Selected Project:</strong> {selectedProject?.name || "None"}
				</p>
				<p className="wwc:text-sm">
					<strong>Active Tab:</strong> {selectedProject ? activeProjectTab : activeOrgTab}
				</p>
			</div>
		</div>
	);
}
