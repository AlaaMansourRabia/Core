import {ExternalLink} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

function storybookBase(): string {
	const configured = (import.meta as unknown as {env?: Record<string, string>}).env?.VITE_STORYBOOK_URL;
	if (configured) return configured.replace(/\/$/, "");
	if (typeof window !== "undefined" && /localhost|127\.0\.0\.1/.test(window.location.hostname)) {
		return "http://localhost:6006";
	}
	return "/storybook";
}

export interface StorybookPreviewPageProps {
	title: string;
	storyId: string;
}

/** Keeps Designer Hub in sync with catalog stories that do not yet have a dedicated native page. */
export function StorybookPreviewPage({title, storyId}: StorybookPreviewPageProps) {
	const base = storybookBase();
	const previewUrl = `${base}/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`;
	const storyUrl = `${base}/?path=/story/${encodeURIComponent(storyId)}`;

	return (
		<section data-core-region="storybook-catalog-preview" data-core-surface-owner="route" className="wwc:space-y-4">
			<Card>
				<CardHeader className="wwc:flex wwc:flex-row wwc:items-start wwc:justify-between wwc:gap-4">
					<div>
						<CardTitle>{title}</CardTitle>
						<CardDescription>
							This live Storybook preview keeps the Designer Hub catalog complete without duplicating the artifact.
						</CardDescription>
					</div>
					<Button variant="outline" size="sm" asChild>
						<a href={storyUrl} target="_blank" rel="noreferrer">
							<ExternalLink />
							Open in Storybook
						</a>
					</Button>
				</CardHeader>
				<CardContent>
					<iframe
						title={`${title} Storybook preview`}
						src={previewUrl}
						className="wwc:h-[680px] wwc:w-full wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background"
					/>
				</CardContent>
			</Card>
		</section>
	);
}
