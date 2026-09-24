/**
 * Avoid ambiguous progress states.
 */
export function ProgressDont() {
	return (
		<div className="wwc:flex wwc:w-full wwc:max-w-lg wwc:items-center wwc:justify-between">
			{/* All steps look the same - no clear indication of progress */}
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<div className="wwc:flex wwc:h-8 wwc:w-8 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-muted">
					1
				</div>
				<span>Details</span>
			</div>
			<div className="wwc:h-px wwc:flex-1 wwc:bg-border wwc:mx-2" />
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<div className="wwc:flex wwc:h-8 wwc:w-8 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-muted">
					2
				</div>
				<span>Review</span>
			</div>
			<div className="wwc:h-px wwc:flex-1 wwc:bg-border wwc:mx-2" />
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<div className="wwc:flex wwc:h-8 wwc:w-8 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-muted">
					3
				</div>
				<span>Submit</span>
			</div>
		</div>
	);
}
