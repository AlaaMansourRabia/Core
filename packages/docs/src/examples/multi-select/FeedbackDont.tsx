/**
 * Avoid hiding selection state from users.
 */
import * as React from "react";

export function FeedbackDont() {
	const [open, setOpen] = React.useState(false);

	return (
		<div className="wwc:relative wwc:w-80">
			<button
				onClick={() => setOpen(!open)}
				className="wwc:flex wwc:h-10 wwc:w-full wwc:items-center wwc:justify-between wwc:rounded-md wwc:border wwc:px-3 wwc:text-sm"
			>
				{/* Just shows placeholder - no indication items are selected */}
				<span className="wwc:text-muted-foreground">Select items...</span>
			</button>
			{open && (
				<div className="wwc:absolute wwc:top-full wwc:mt-1 wwc:w-full wwc:rounded-md wwc:border wwc:bg-popover wwc:p-1 wwc:shadow-md">
					{/* Checkboxes hidden in dropdown - no count shown */}
					<div className="wwc:text-sm wwc:p-2 wwc:text-muted-foreground">
						3 items currently selected but not shown
					</div>
				</div>
			)}
		</div>
	);
}
