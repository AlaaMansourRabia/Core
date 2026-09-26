/**
 * Avoid hiding scrollbars when content overflows.
 */
export function IndicatorDont() {
	return (
		<div className="wwc:h-32 wwc:w-64 wwc:overflow-hidden wwc:rounded-md wwc:border">
			<div className="wwc:p-4">
				{Array.from({length: 15}, (_, i) => (
					<div key={i} className="wwc:py-1 wwc:text-sm">
						Item {i + 1}
					</div>
				))}
			</div>
			{/* Content is cut off with no way to scroll */}
		</div>
	);
}
