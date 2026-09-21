import {Eye, EyeOff, LogIn} from "lucide-react";
import {useState} from "react";

import {Button} from "../button";
import {Input} from "../input";
import {Label} from "../label";

interface LoginPageProps {
	onLogin?: (email: string, password: string) => void;
}

/** Authentication page with email/password form and Core branding. */
export function LoginPage({onLogin}: LoginPageProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Simulate login
		await new Promise((resolve) => setTimeout(resolve, 1000));
		onLogin?.(email, password);
		setIsLoading(false);
	};

	return (
		<div className="wwc:flex wwc:h-screen wwc:w-full">
			{/* Image Section - Takes most of the screen */}
			<div className="wwc:hidden wwc:lg:flex wwc:lg:w-2/3 wwc:bg-muted wwc:items-center wwc:justify-center wwc:relative wwc:overflow-hidden">
				<img
					src="/images/controlroom.png"
					alt="Control room with data dashboards"
					className="wwc:absolute wwc:inset-0 wwc:w-full wwc:h-full wwc:object-cover"
				/>
				<div className="wwc:absolute wwc:inset-0 wwc:bg-black/20" />
			</div>

			{/* Login Form Section */}
			<div className="wwc:w-full wwc:lg:w-1/3 wwc:flex wwc:items-center wwc:justify-center wwc:p-8 wwc:bg-background">
				<div className="wwc:w-full wwc:max-w-sm wwc:space-y-8">
					{/* Logo/Brand */}
					<div className="wwc:space-y-2">
						<h1 className="wwc:text-2xl wwc:font-bold wwc:tracking-tight wwc:text-foreground">Welcome back</h1>
						<p className="wwc:text-sm wwc:text-muted-foreground">Enter your credentials to access your account</p>
					</div>

					{/* Login Form */}
					<form onSubmit={handleSubmit} className="wwc:space-y-6">
						{/* Email Field */}
						<div className="wwc:space-y-2">
							<Label htmlFor="email" className="wwc:text-sm wwc:font-medium">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@company.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="wwc:h-10"
							/>
						</div>

						{/* Password Field */}
						<div className="wwc:space-y-2">
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<Label htmlFor="password" className="wwc:text-sm wwc:font-medium">
									Password
								</Label>
								<Button
									type="button"
									variant="link"
									className="wwc:h-auto wwc:p-0 wwc:text-xs wwc:text-muted-foreground wwc:hover:text-foreground"
								>
									Forgot password?
								</Button>
							</div>
							<div className="wwc:relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="wwc:h-10 wwc:pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									icon
									className="wwc:absolute wwc:right-0 wwc:top-0 wwc:h-10 wwc:w-10 wwc:text-muted-foreground wwc:hover:text-foreground"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? <EyeOff className="wwc:h-4 wwc:w-4" /> : <Eye className="wwc:h-4 wwc:w-4" />}
								</Button>
							</div>
						</div>

						{/* Submit Button */}
						<Button type="submit" className="wwc:w-full wwc:h-10" disabled={isLoading || !email || !password}>
							{isLoading ? (
								<span className="wwc:flex wwc:items-center wwc:gap-2">
									<span className="wwc:h-4 wwc:w-4 wwc:animate-spin wwc:rounded-full wwc:border-2 wwc:border-current wwc:border-t-transparent" />
									Signing in...
								</span>
							) : (
								<span className="wwc:flex wwc:items-center wwc:gap-2">
									<LogIn className="wwc:h-4 wwc:w-4" />
									Sign in
								</span>
							)}
						</Button>
					</form>

					{/* Footer */}
					<p className="wwc:text-center wwc:text-xs wwc:text-muted-foreground">
						By signing in, you agree to our{" "}
						<Button variant="link" className="wwc:h-auto wwc:p-0 wwc:text-xs">
							Terms of Service
						</Button>{" "}
						and{" "}
						<Button variant="link" className="wwc:h-auto wwc:p-0 wwc:text-xs">
							Privacy Policy
						</Button>
					</p>
				</div>
			</div>
		</div>
	);
}
