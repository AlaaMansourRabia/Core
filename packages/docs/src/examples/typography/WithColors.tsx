/**
 * Typography with semantic colors.
 */
import {Typography} from "@corensystem/coren-ui/typography";

export function WithColors() {
	return (
		<div className="wwc:space-y-2">
			<Typography color="default">Default text color</Typography>
			<Typography color="muted">Muted secondary text</Typography>
			<Typography color="primary">Primary brand color</Typography>
			<Typography color="success">Success message</Typography>
			<Typography color="warning">Warning message</Typography>
			<Typography color="destructive">Error message</Typography>
		</div>
	);
}
