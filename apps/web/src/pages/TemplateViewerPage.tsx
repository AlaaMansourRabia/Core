import type {ReactNode} from "react";

import {MOCK_ORGANIZATIONS, getProjectsByOrg} from "@corensystem/core-ui/data/mock-data";
// Renders any Core template by id (route /templates/:id) — the real @corensystem/core-ui
// page with representative mock data, so the Designer Hub's Templates section shows the live template.
import {ErrorPage} from "@corensystem/core-ui/error-page";
import {FragmentViewer, FragmentViewerProvider} from "@corensystem/core-ui/fragment-viewer";
import {AdminPanel} from "@corensystem/core-ui/pages/core-admin-panel";
import {AnalyticsOverview} from "@corensystem/core-ui/pages/core-analytics-overview";
import {AppInstaller} from "@corensystem/core-ui/pages/core-app-installer";
import {BlueprintViewer} from "@corensystem/core-ui/pages/core-blueprint-viewer";
import {BlueprintViewer3} from "@corensystem/core-ui/pages/core-blueprint-viewer-3";
import {Clinic} from "@corensystem/core-ui/pages/core-clinic";
import {CoreConnect} from "@corensystem/core-ui/pages/core-core-connect";
import {CoreConnectV3} from "@corensystem/core-ui/pages/core-core-connect-v3";
import {DesignCanvas} from "@corensystem/core-ui/pages/core-design-canvas";
import {LoginPage} from "@corensystem/core-ui/pages/core-login-page";
import {MapCompareLayout} from "@corensystem/core-ui/pages/core-map-compare-layout";
import {OrgWorkforceIntelligence} from "@corensystem/core-ui/pages/core-org-workforce-intelligence";
import {ProgressDetails} from "@corensystem/core-ui/pages/core-progress-details";
import {ProjectOverview} from "@corensystem/core-ui/pages/core-project-overview";
import {ProjectRealityCapture} from "@corensystem/core-ui/pages/core-project-reality-capture";
import {ProjectScheduleCost} from "@corensystem/core-ui/pages/core-project-schedule-cost";
import {ProjectSetup} from "@corensystem/core-ui/pages/core-project-setup";
import {ProjectWorkforceSafety} from "@corensystem/core-ui/pages/core-project-workforce-safety";
import {SafetyManager} from "@corensystem/core-ui/pages/core-safety-manager";
import {VerifyTimeCommandCenter} from "@corensystem/core-ui/pages/core-verifytime-command-center";
import {WC3Workspace} from "@corensystem/core-ui/pages/core-wc3-workspace";
import {WorkPermit} from "@corensystem/core-ui/pages/core-work-permit";
import {Workforce} from "@corensystem/core-ui/pages/core-workforce";
import {TooltipProvider} from "@corensystem/core-ui/tooltip";
import workerUrl from "@thatopen/fragments/worker?url";
import {useParams} from "react-router-dom";

import {SiteRealityStage} from "@/components/SiteRealityStage";
import {ObjectDrawingCanvasPage} from "@/pages/examples/ObjectDrawingCanvasPage";

const org = MOCK_ORGANIZATIONS[0];
const project = getProjectsByOrg(org.id)[0];
const noop = () => {};

// The compatibility implementation remains the source of the renamed Timesheet catalog template.
function VerifytimeCommandCenter() {
	return <VerifyTimeCommandCenter />;
}

function WorkforceMapStage() {
	return (
		<div
			className="wwc:absolute wwc:inset-0"
			data-core-region="workforce-model-canvas"
			data-core-surface-owner="artifact"
			data-core-canvas-capabilities="orbit,pan,zoom,fit-to-view,selection"
		>
			<FragmentViewer
				src="/models-bundled/uptown.frag"
				fallbackSrc="/models/vd2.frag"
				modelId="uptown"
				workerUrl={workerUrl}
				showLogo={false}
				selectFloorsOnly
			/>
		</div>
	);
}

function WorkforceTemplate() {
	return (
		<FragmentViewerProvider>
			<Workforce mapStage={<WorkforceMapStage />} />
		</FragmentViewerProvider>
	);
}

const REGISTRY: Record<string, () => ReactNode> = {
	"analytics-overview": () => <AnalyticsOverview />,
	"admin-panel": () => <AdminPanel />,
	"safety-manager": () => <SafetyManager />,
	"site-reality": () => <SiteRealityStage />,
	"core-org-workforce-intelligence": () => <OrgWorkforceIntelligence selectedOrg={org} />,
	"core-project-overview": () => <ProjectOverview project={project} />,
	"core-project-reality-capture": () => <ProjectRealityCapture project={project} />,
	"core-project-schedule-cost": () => <ProjectScheduleCost project={project} />,
	"core-project-workforce-safety": () => <ProjectWorkforceSafety project={project} />,
	"project-setup": () => <ProjectSetup />,
	"design-canvas": () => <DesignCanvas />,
	"login-page": () => <LoginPage onLogin={noop} />,
	"error-page": () => (
		<ErrorPage
			type="404"
			code="404"
			title="Page not found"
			description="The page you're looking for doesn't exist or was moved."
			showCode
		/>
	),
	"app-installer": () => <AppInstaller />,
	"blueprint-viewer": () => <BlueprintViewer />,
	"blueprint-viewer-3": () => <BlueprintViewer3 />,
	clinic: () => <Clinic />,
	"map-compare-layout": () => <MapCompareLayout />,
	"object-drawing-canvas": () => <ObjectDrawingCanvasPage />,
	"progress-details": () => <ProgressDetails />,
	"core-connect": () => <CoreConnect />,
	"core-connect-v3": () => <CoreConnectV3 />,
	"wc3-workspace": () => <WC3Workspace />,
	"work-permit": () => <WorkPermit />,
	workforce: () => <WorkforceTemplate />,
};

export function TemplateViewerPage() {
	const {id} = useParams<{id: string}>();
	if (id === "timesheet") {
		return (
			<TooltipProvider>
				<div
					className="wwc:h-full wwc:min-h-0"
					data-core-region="timesheet-template"
					data-core-artifact="timesheet"
					data-core-surface-owner="artifact"
				>
					<VerifytimeCommandCenter />
				</div>
			</TooltipProvider>
		);
	}
	const render = id ? REGISTRY[id] : undefined;
	if (!render) {
		return <div className="wwc:p-8 wwc:text-sm wwc:text-muted-foreground">Unknown template: {id}</div>;
	}
	return (
		<TooltipProvider>
			<div
				className="wwc:h-full wwc:min-h-0"
				data-core-region={`${id}-template`}
				data-core-artifact={id}
				data-core-surface-owner="artifact"
			>
				{render()}
			</div>
		</TooltipProvider>
	);
}
