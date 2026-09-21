import {Button} from "@wakecap/core-ui/button";
import {Github, ShieldAlert} from "lucide-react";
import {useEffect, useState} from "react";

// The sign-in screen. The edge gate (middleware.js) redirects anonymous visitors here; clicking the
// button hands off to /api/auth/login, which runs the GitHub OAuth flow and returns to `return_to`.
// Reachable directly at /login (so it can be previewed in dev, where the gate doesn't run).

const THEME_KEY = "wc-hub-theme";

function safeReturnTo(p: string | null): string {
	if (!p || !p.startsWith("/") || p.startsWith("//")) return "/";
	return p;
}

const ERRORS: Record<string, string> = {
	not_a_member: "That GitHub account isn't a member of the wakecap organization.",
	bad_state: "Your sign-in session expired. Please try again.",
};

export function LoginPage() {
	const params = new URLSearchParams(window.location.search);
	const returnTo = safeReturnTo(params.get("return_to"));
	const authError = params.get("auth_error");
	const [checking, setChecking] = useState(true);

	// Match the Hub's default theme (dark unless the user chose light).
	useEffect(() => {
		document.documentElement.classList.toggle("dark", localStorage.getItem(THEME_KEY) !== "light");
	}, []);

	// If a real session already exists, skip the screen and go straight in. We must parse JSON and check
	// `login` — in dev, Vite's SPA fallback answers /api/auth/me with 200 HTML, which would otherwise
	// look "ok" and bounce us off the page we're trying to preview.
	useEffect(() => {
		let alive = true;
		fetch("/api/auth/me", {credentials: "same-origin"})
			.then((r) => (r.ok ? r.json() : null))
			.then((u) => {
				if (alive && u?.login) window.location.replace(returnTo);
				else if (alive) setChecking(false);
			})
			.catch(() => alive && setChecking(false));
		return () => {
			alive = false;
		};
	}, [returnTo]);

	const message = authError ? (ERRORS[authError] ?? "Sign-in failed. Please try again.") : null;

	return (
		<div className="wwc:flex wwc:h-screen wwc:items-center wwc:justify-center wwc:bg-background wwc:p-6 wwc:text-foreground">
			<div className="wwc:flex wwc:w-full wwc:max-w-sm wwc:flex-col wwc:items-center wwc:text-center">
				<img
					src="/wakecore-large.svg"
					alt="WakeCore"
					className="wwc:mb-8 wwc:h-6 wwc:w-auto wwc:invert wwc:dark:invert-0"
				/>

				<h1 className="wwc:text-lg wwc:font-semibold">Sign in to WakeCore</h1>
				<p className="wwc:mt-2 wwc:text-sm wwc:text-muted-foreground">
					Access is restricted to members of the <span className="wwc:font-medium wwc:text-foreground">wakecap</span>{" "}
					GitHub organization.
				</p>

				{message && (
					<div className="wwc:mt-5 wwc:flex wwc:w-full wwc:items-start wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-destructive/40 wwc:bg-destructive/10 wwc:p-3 wwc:text-left wwc:text-xs wwc:text-destructive">
						<ShieldAlert className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:flex-shrink-0" />
						<span>{message}</span>
					</div>
				)}

				<Button
					className="wwc:mt-6 wwc:w-full"
					disabled={checking}
					onClick={() => {
						window.location.href = `/api/auth/login?return_to=${encodeURIComponent(returnTo)}`;
					}}
				>
					<Github />
					Continue with GitHub
				</Button>
			</div>
		</div>
	);
}
