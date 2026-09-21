import {Skeleton} from "../skeleton";
import type {OrgTab, Organization, Project, ProjectTab} from "../types";
import type {DashboardWidget} from "../types/chat";
import {OrgAIReport} from "./core-org-ai-report";
import {OrgOverview} from "./core-org-overview";
import {OrgPerformance} from "./core-org-performance";
import {OrgRealityCapture} from "./core-org-reality-capture";
import {OrgWorkforceIntelligence} from "./core-org-workforce-intelligence";
import {ProjectOverview} from "./core-project-overview";
import {ProjectQualityIssues} from "./core-project-quality-issues";
import {ProjectRealityCapture} from "./core-project-reality-capture";
import {ProjectScheduleCost} from "./core-project-schedule-cost";
import {ProjectWorkforceSafety} from "./core-project-workforce-safety";

interface ContentAreaProps {
	selectedOrg: Organization | null;
	selectedProject: Project | null;
	activeOrgTab: OrgTab;
	activeProjectTab: ProjectTab;
	isProjectLevel: boolean;
	onOpenProject?: (project: Project) => void;
	addedWidgets?: DashboardWidget[];
}

export function ContentArea({
	selectedOrg,
	selectedProject,
	activeOrgTab,
	activeProjectTab,
	isProjectLevel,
	onOpenProject,
	addedWidgets = [],
}: ContentAreaProps) {
	const currentTab = isProjectLevel ? activeProjectTab : activeOrgTab;
	const contextName = isProjectLevel ? selectedProject?.name : selectedOrg?.name;

	// Filter widgets by target tab
	const performanceWidgets = addedWidgets.filter((w) => w.targetTab === "performance");
	const workforceWidgets = addedWidgets.filter((w) => w.targetTab === "workforce");

	// Show OrgOverview for org-level overview tab
	if (!isProjectLevel && activeOrgTab === "overview" && selectedOrg) {
		return (
			<main className="wwc:flex-1">
				<OrgOverview selectedOrg={selectedOrg} onOpenProject={onOpenProject} />
			</main>
		);
	}

	// Show OrgPerformance for org-level performance tab
	if (!isProjectLevel && activeOrgTab === "performance" && selectedOrg) {
		return (
			<main className="wwc:flex-1 wwc:flex wwc:flex-col">
				<OrgPerformance selectedOrg={selectedOrg} addedWidgets={performanceWidgets} />
			</main>
		);
	}

	// Show OrgWorkforceIntelligence for org-level workforce-intelligence tab
	if (!isProjectLevel && activeOrgTab === "workforce-intelligence" && selectedOrg) {
		return (
			<main className="wwc:flex-1 wwc:flex wwc:flex-col">
				<OrgWorkforceIntelligence selectedOrg={selectedOrg} addedWidgets={workforceWidgets} />
			</main>
		);
	}

	// Show OrgRealityCapture for org-level reality-capture tab
	if (!isProjectLevel && activeOrgTab === "reality-capture" && selectedOrg) {
		return (
			<main className="wwc:flex-1 wwc:flex wwc:flex-col">
				<OrgRealityCapture selectedOrg={selectedOrg} />
			</main>
		);
	}

	// Show OrgAIReport for org-level ai-report tab
	if (!isProjectLevel && activeOrgTab === "ai-report" && selectedOrg) {
		return (
			<main className="wwc:flex-1 wwc:flex wwc:flex-col">
				<OrgAIReport selectedOrg={selectedOrg} />
			</main>
		);
	}

	// Project-level tabs
	if (isProjectLevel && selectedProject) {
		// Project Overview
		if (activeProjectTab === "overview") {
			return (
				<main className="wwc:flex-1 wwc:flex wwc:flex-col">
					<ProjectOverview project={selectedProject} />
				</main>
			);
		}

		// Schedule & Cost
		if (activeProjectTab === "schedule-cost") {
			return (
				<main className="wwc:flex-1 wwc:flex wwc:flex-col">
					<ProjectScheduleCost project={selectedProject} />
				</main>
			);
		}

		// Workforce & Safety
		if (activeProjectTab === "workforce-safety") {
			return (
				<main className="wwc:flex-1 wwc:flex wwc:flex-col">
					<ProjectWorkforceSafety project={selectedProject} />
				</main>
			);
		}

		// Quality & Issues
		if (activeProjectTab === "quality-issues") {
			return (
				<main className="wwc:flex-1 wwc:flex wwc:flex-col">
					<ProjectQualityIssues project={selectedProject} />
				</main>
			);
		}

		// Reality Capture
		if (activeProjectTab === "reality-capture") {
			return (
				<main className="wwc:flex-1 wwc:flex wwc:flex-col">
					<ProjectRealityCapture project={selectedProject} />
				</main>
			);
		}
	}

	return (
		<main className="wwc:flex-1 wwc:p-6">
			<div className="wwc:mx-auto wwc:max-w-6xl wwc:space-y-6">
				{/* Page Title */}
				<div className="wwc:space-y-1">
					<h1 className="wwc:text-2xl wwc:font-semibold wwc:capitalize">{currentTab.replace("-", " ")}</h1>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						{isProjectLevel ? "Project" : "Organization"}: {contextName}
					</p>
				</div>

				{/* Placeholder Content */}
				<div className="wwc:grid wwc:gap-4 wwc:md:grid-cols-2 wwc:lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<div key={i} className="wwc:rounded-lg wwc:border wwc:bg-card wwc:p-6 wwc:shadow-sm">
							<div className="wwc:space-y-3">
								<Skeleton className="wwc:h-4 wwc:w-1/2" />
								<Skeleton className="wwc:h-8 wwc:w-3/4" />
								<Skeleton className="wwc:h-4 wwc:w-full" />
								<Skeleton className="wwc:h-4 wwc:w-2/3" />
							</div>
						</div>
					))}
				</div>

				{/* Info Card */}
				<div className="wwc:rounded-lg wwc:border wwc:bg-muted/50 wwc:p-6">
					<h2 className="wwc:mb-2 wwc:font-medium">Current Navigation State</h2>
					<div className="wwc:space-y-1 wwc:text-sm wwc:text-muted-foreground">
						<p>
							<span className="wwc:font-medium wwc:text-foreground">Organization:</span> {selectedOrg?.name} (
							{selectedOrg?.plan})
						</p>
						<p>
							<span className="wwc:font-medium wwc:text-foreground">Project:</span>{" "}
							{selectedProject?.name || "None selected"}
						</p>
						<p>
							<span className="wwc:font-medium wwc:text-foreground">Context:</span>{" "}
							{isProjectLevel ? "Project Level" : "Organization Level"}
						</p>
						<p>
							<span className="wwc:font-medium wwc:text-foreground">Active Tab:</span> {currentTab}
						</p>
					</div>
				</div>

				{/* Instructions */}
				<div className="wwc:rounded-lg wwc:border wwc:p-6">
					<h2 className="wwc:mb-3 wwc:font-medium">How to Use</h2>
					<ul className="wwc:space-y-2 wwc:text-sm wwc:text-muted-foreground">
						<li>
							<span className="wwc:font-medium wwc:text-foreground">1.</span> Click the organization name in the header
							to open the switcher
						</li>
						<li>
							<span className="wwc:font-medium wwc:text-foreground">2.</span> Select a organization from the left column
						</li>
						<li>
							<span className="wwc:font-medium wwc:text-foreground">3.</span> Select a project from the right column to
							switch to project-level view
						</li>
						<li>
							<span className="wwc:font-medium wwc:text-foreground">4.</span> Notice how the tabs change based on your
							selection
						</li>
						<li>
							<span className="wwc:font-medium wwc:text-foreground">5.</span> Click the project name to go back to
							organization level
						</li>
					</ul>
				</div>
			</div>
		</main>
	);
}
