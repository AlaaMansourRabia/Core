import {Wand2} from "lucide-react";

// Studio (compose + preview pages, then hand off to your editor) needs a local Node backend to run, so
// it isn't available in the hosted hub yet — show a "coming soon" placeholder in its tab.
export function StudioPage() {
	return (
		<div className="wwc:flex wwc:min-h-[60vh] wwc:items-center wwc:justify-center wwc:p-6">
			<div className="wwc:max-w-lg wwc:text-center">
				<div className="wwc:mx-auto wwc:flex wwc:h-12 wwc:w-12 wwc:items-center wwc:justify-center wwc:rounded-xl wwc:bg-primary/10 wwc:text-primary">
					<Wand2 className="wwc:h-6 wwc:w-6" />
				</div>
				<div className="wwc:mt-4 wwc:inline-flex wwc:items-center wwc:gap-2">
					<h1 className="wwc:text-2xl wwc:font-semibold wwc:tracking-tight">Core Studio</h1>
					<span className="wwc:rounded-full wwc:border wwc:border-border wwc:bg-muted/50 wwc:px-2.5 wwc:py-0.5 wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
						Coming soon
					</span>
				</div>
				<p className="wwc:mt-3 wwc:text-sm wwc:leading-relaxed wwc:text-muted-foreground">
					Compose and preview pages from the Core library, then hand the work off to your editor. Studio is on its
					way to the hub — check back soon.
				</p>
			</div>
		</div>
	);
}
