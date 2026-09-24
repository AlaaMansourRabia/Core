/**
 * Avoid deeply nested navigation menus.
 */
export function DepthDont() {
	return (
		<div className="wwc:rounded-md wwc:border wwc:p-4 wwc:w-64">
			<div className="wwc:text-sm">
				{/* Simulated deep nesting - confusing and hard to use */}
				<div className="wwc:py-1">Resources ▸</div>
				<div className="wwc:ml-4 wwc:border-l wwc:pl-2">
					<div className="wwc:py-1">Documentation ▸</div>
					<div className="wwc:ml-4 wwc:border-l wwc:pl-2">
						<div className="wwc:py-1">Getting Started ▸</div>
						<div className="wwc:ml-4 wwc:border-l wwc:pl-2">
							<div className="wwc:py-1">Installation ▸</div>
							<div className="wwc:ml-4 wwc:border-l wwc:pl-2 wwc:text-muted-foreground">
								<div className="wwc:py-1">npm</div>
								<div className="wwc:py-1">yarn</div>
								<div className="wwc:py-1">pnpm</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
