/**
 * Avoid fixed pixel dimensions that break at different sizes.
 */
export function ResponsiveDont() {
	return (
		<div className="wwc:overflow-hidden">
			{/* Fixed dimensions don't adapt to container */}
			<div className="wwc:flex wwc:h-[200px] wwc:w-[400px] wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted">
				<span className="wwc:text-muted-foreground wwc:text-sm">Fixed 400x200px - may overflow</span>
			</div>
		</div>
	);
}
