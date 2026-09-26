/**
 * Stack gap options from none to xl.
 */
import {Stack} from "@corensystem/coren-ui/stack";

export function Gaps() {
	return (
		<Stack direction="row" gap="lg" align="start">
			<Stack gap="xs" className="wwc:w-16">
				<div className="wwc:h-4 wwc:rounded wwc:bg-muted" />
				<div className="wwc:h-4 wwc:rounded wwc:bg-muted" />
				<span className="wwc:text-xs wwc:text-muted-foreground">xs</span>
			</Stack>
			<Stack gap="sm" className="wwc:w-16">
				<div className="wwc:h-4 wwc:rounded wwc:bg-muted" />
				<div className="wwc:h-4 wwc:rounded wwc:bg-muted" />
				<span className="wwc:text-xs wwc:text-muted-foreground">sm</span>
			</Stack>
			<Stack gap="md" className="wwc:w-16">
				<div className="wwc:h-4 wwc:rounded wwc:bg-muted" />
				<div className="wwc:h-4 wwc:rounded wwc:bg-muted" />
				<span className="wwc:text-xs wwc:text-muted-foreground">md</span>
			</Stack>
			<Stack gap="lg" className="wwc:w-16">
				<div className="wwc:h-4 wwc:rounded wwc:bg-muted" />
				<div className="wwc:h-4 wwc:rounded wwc:bg-muted" />
				<span className="wwc:text-xs wwc:text-muted-foreground">lg</span>
			</Stack>
		</Stack>
	);
}
