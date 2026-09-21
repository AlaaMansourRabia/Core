import {Github} from "lucide-react";

import {Button} from "@/components/ui/button";

export function WelcomePage() {
	return (
		<div className="wwc:relative wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:min-h-[calc(100vh-10rem)] wwc:text-center wwc:mx-auto">
			{/* Scrim gradient background - breaks out of container to fill main area */}
			<div
				className="wwc:fixed wwc:top-14 wwc:right-0 wwc:bottom-0 wwc:pointer-events-none"
				style={{
					left: "var(--sidebar-width, 256px)",
					background: `
            radial-gradient(
              ellipse 150% 80% at 50% 100%,
              hsl(30 90% 65% / 0.35) 0%,
              hsl(30 85% 62% / 0.28) 7%,
              hsl(30 80% 58% / 0.22) 15%,
              hsl(28 75% 55% / 0.16) 25%,
              hsl(25 70% 52% / 0.1) 40%,
              hsl(22 60% 48% / 0.05) 60%,
              hsl(20 50% 45% / 0.02) 80%,
              transparent 100%
            )
          `,
				}}
			/>

			{/* Edge fading overlays */}
			<div
				className="wwc:fixed wwc:top-14 wwc:right-0 wwc:bottom-0 wwc:pointer-events-none"
				style={{
					left: "var(--sidebar-width, 256px)",
					background: `
            linear-gradient(to right, var(--background) 0%, transparent 8%, transparent 92%, var(--background) 100%),
            linear-gradient(to bottom, var(--background) 0%, transparent 15%)
          `,
				}}
			/>
			<h1 className="wwc:text-4xl wwc:md:text-6xl wwc:font-light wwc:mb-6 animate-fade-in-up">
				<span className="wwc:whitespace-nowrap">Core design framework</span>
				<br />
				<span className="wwc:whitespace-nowrap">
					by{" "}
					<a
						href="https://core.com"
						target="_blank"
						rel="noopener noreferrer"
						className="wwc:hover:text-muted-foreground wwc:transition-colors"
					>
						core.com
					</a>
				</span>
			</h1>
			<p className="wwc:text-muted-foreground wwc:max-w-lg wwc:mb-8 animate-fade-in-up animation-delay-100">
				A comprehensive design system built for consistency, accessibility, and developer experience.
			</p>
			<Button variant="ghost" asChild className="animate-fade-in-up animation-delay-200 gradient-border rounded-full">
				<a href="https://github.com/core/Design-Agent" target="_blank" rel="noopener noreferrer">
					<Github />
					Build with Design Agent
				</a>
			</Button>
		</div>
	);
}
