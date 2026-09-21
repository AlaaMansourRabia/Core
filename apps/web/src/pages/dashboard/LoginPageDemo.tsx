import {LoginPage} from "@/components/ui/pages/core-login-page";

export function LoginPageDemo() {
	const handleLogin = (email: string, password: string) => {
		console.log("Login wwc:attempt:", {email, password});
		alert(`Login attempted with wwc:email: ${email}`);
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Login Page</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A styled login page component with email and password fields.
				</p>
			</div>

			<div className="wwc:border wwc:rounded-lg wwc:overflow-hidden" style={{height: "600px"}}>
				<LoginPage onLogin={handleLogin} />
			</div>
		</div>
	);
}
