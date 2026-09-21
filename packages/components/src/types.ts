// Organization types
export interface Organization {
	id: string;
	name: string;
	plan: "free" | "pro" | "enterprise";
	logo?: string;
}

// Project types
export type ProjectStatus = "active" | "on-hold" | "completed" | "at-risk" | "delayed" | "on-track" | "critical";
export type HealthStatus = "on-track" | "at-risk" | "critical";
export type SafetyStatus = "safe" | "warning" | "danger";

export interface Project {
	id: string;
	orgId: string;
	name: string;
	description?: string;
	thumbnail?: string;
	status?: ProjectStatus;
	coordinates?: [number, number]; // [lng, lat]
	readiness?: number; // 0-100
	scheduleHealth?: HealthStatus;
	schedulePercent?: number;
	costHealth?: HealthStatus;
	cpi?: number; // Cost Performance Index
	ltiFreeDay?: number; // Lost Time Injury free days
	safetyStatus?: SafetyStatus;
	workforceDensity?: number;
	qualityScore?: number;
	startDate?: string;
	endDate?: string;
	budget?: number;
	spent?: number;
	safetyAlerts?: number;
	budgetVariance?: number;
}

// Navigation tab types
export type OrgTab = "overview" | "performance" | "workforce-intelligence" | "reality-capture" | "ai-report";
export type ProjectTab = "overview" | "schedule-cost" | "workforce-safety" | "quality-issues" | "reality-capture";

export interface TabItem {
	id: string;
	label: string;
}

export const ORG_TABS: TabItem[] = [
	{id: "overview", label: "Overview"},
	{id: "performance", label: "Performance"},
	{id: "workforce-intelligence", label: "Workforce Intelligence"},
	{id: "reality-capture", label: "Reality Capture"},
	{id: "ai-report", label: "AI Report"},
];

export const PROJECT_TABS: TabItem[] = [
	{id: "overview", label: "Overview"},
	{id: "schedule-cost", label: "Schedule & Cost"},
	{id: "workforce-safety", label: "Workforce & Safety"},
	{id: "quality-issues", label: "Quality & Issues"},
	{id: "reality-capture", label: "Reality Capture"},
];
