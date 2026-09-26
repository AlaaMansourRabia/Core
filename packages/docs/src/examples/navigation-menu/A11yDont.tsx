/**
 * Avoid custom menus without keyboard support.
 */
import * as React from "react";

export function A11yDont() {
	const [open, setOpen] = React.useState(false);

	return (
		<div className="wwc:relative">
			{/* Custom dropdown without ARIA or keyboard support */}
			<div
				className="wwc:inline-flex wwc:h-10 wwc:items-center wwc:rounded-md wwc:bg-background wwc:px-4 wwc:text-sm wwc:cursor-pointer wwc:hover:bg-accent"
				onClick={() => setOpen(!open)}
			>
				Menu ▾
			</div>
			{open && (
				<div className="wwc:absolute wwc:top-full wwc:mt-1 wwc:w-48 wwc:rounded-md wwc:border wwc:bg-popover wwc:p-2 wwc:shadow-md">
					{/* No keyboard navigation */}
					<div className="wwc:p-2 wwc:text-sm wwc:cursor-pointer wwc:hover:bg-accent wwc:rounded-md">Option 1</div>
					<div className="wwc:p-2 wwc:text-sm wwc:cursor-pointer wwc:hover:bg-accent wwc:rounded-md">Option 2</div>
				</div>
			)}
		</div>
	);
}
