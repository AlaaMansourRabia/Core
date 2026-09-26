/**
 * Avoid invisible or hard-to-find resize handles.
 */
export function HandleDont() {
	return (
		<div className="wwc:flex wwc:min-h-48 wwc:max-w-md wwc:rounded-lg wwc:border">
			<div className="wwc:flex wwc:flex-1 wwc:items-center wwc:justify-center wwc:p-6">
				<span className="wwc:font-semibold">Panel A</span>
			</div>
			{/* Invisible divider - no visual indication it's resizable */}
			<div className="wwc:w-px wwc:bg-border" />
			<div className="wwc:flex wwc:flex-1 wwc:items-center wwc:justify-center wwc:p-6">
				<span className="wwc:font-semibold">Panel B</span>
			</div>
		</div>
	);
}
