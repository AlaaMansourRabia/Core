import {Button} from "@wakecap/core-ui";
import {useNavigate} from "react-router-dom";

export function ReportsCta() {
	const navigate = useNavigate();
	return <Button onClick={() => navigate("/reports")}>View reports</Button>;
}
