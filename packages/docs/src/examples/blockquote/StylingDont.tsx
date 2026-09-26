/**
 * Avoid quotes without visual distinction.
 */
export function StylingDont() {
	return (
		<div className="wwc:space-y-4 wwc:text-sm">
			<p>Here's what our customers are saying:</p>
			{/* Quote looks same as regular text - hard to distinguish */}
			<p>"This product completely changed how we work. I can't imagine going back."</p>
			<p>Join thousands of satisfied users today.</p>
		</div>
	);
}
