import {Button} from "@wakecap/core-ui/button";
import {Link} from "react-router-dom";

export function ReportsCta() {
	return (
		<Button asChild>
			<Link to="/reports">View reports</Link>
		</Button>
	);
}
