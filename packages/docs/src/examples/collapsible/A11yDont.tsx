/**
 * Avoid non-interactive triggers without keyboard support.
 */
export function A11yDont() {
	return (
		<div className="wwc:w-80 wwc:space-y-2">
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:px-4">
				<h4 className="wwc:text-sm wwc:font-semibold">Notifications</h4>
				{/* Using div instead of button - not keyboard accessible */}
				<div className="wwc:cursor-pointer wwc:p-2 wwc:text-sm wwc:text-muted-foreground">
					Show/Hide
				</div>
			</div>
			<div className="wwc:space-y-2">
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-3 wwc:text-sm">
					New message from support
				</div>
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-3 wwc:text-sm">
					Your order has shipped
				</div>
			</div>
		</div>
	);
}
