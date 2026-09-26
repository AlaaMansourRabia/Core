/**
 * Avoid collapsibles without visual affordance.
 */
export function IconDont() {
	return (
		<div className="wwc:w-72 wwc:rounded-lg wwc:border">
			<div className="wwc:p-4 wwc:font-medium wwc:cursor-pointer">
				More options
				{/* No icon - user doesn't know this is expandable */}
			</div>
			<div className="wwc:hidden wwc:border-t wwc:p-4 wwc:text-sm">
				Additional settings and preferences
			</div>
		</div>
	);
}
