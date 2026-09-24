/**
 * Avoid inconsistent aspect ratios in grids.
 */
export function ConsistencyDont() {
	return (
		<div className="wwc:grid wwc:grid-cols-3 wwc:gap-4 wwc:w-96">
			{/* Inconsistent heights - looks messy */}
			<div className="wwc:h-20 wwc:rounded-md wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center">
				<span className="wwc:text-muted-foreground wwc:text-sm">Photo 1</span>
			</div>
			<div className="wwc:h-32 wwc:rounded-md wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center">
				<span className="wwc:text-muted-foreground wwc:text-sm">Photo 2</span>
			</div>
			<div className="wwc:h-24 wwc:rounded-md wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center">
				<span className="wwc:text-muted-foreground wwc:text-sm">Photo 3</span>
			</div>
		</div>
	);
}
