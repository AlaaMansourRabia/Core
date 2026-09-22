import {Button} from "@corensystem/core-ui/button";

type BlueprintCanvasErrorFallbackProps = {
	error: unknown;
	resetError: () => void;
};

export function BlueprintCanvasErrorFallback({error, resetError}: BlueprintCanvasErrorFallbackProps) {
	const message = error instanceof Error ? error.message : "The blueprint editor could not be rendered.";

	return (
		<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background p-6 text-center">
			<p className="max-w-sm text-sm text-destructive">{message}</p>
			<Button type="button" variant="outline" size="sm" onClick={resetError}>
				Retry
			</Button>
		</div>
	);
}
