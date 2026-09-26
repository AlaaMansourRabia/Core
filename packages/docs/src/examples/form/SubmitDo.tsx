/**
 * Disable submit during submission and show progress.
 */
import * as React from "react";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";
import {Button} from "@corensystem/coren-ui/button";
import {Spinner} from "@corensystem/coren-ui/spinner";

export function SubmitDo() {
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setTimeout(() => setIsSubmitting(false), 2000);
	};

	return (
		<form onSubmit={handleSubmit} className="wwc:w-full wwc:max-w-sm wwc:space-y-4">
			<div className="wwc:space-y-2">
				<Label htmlFor="form-submit-do-email">Email</Label>
				<Input
					id="form-submit-do-email"
					type="email"
					placeholder="you@example.com"
					disabled={isSubmitting}
				/>
			</div>
			<Button type="submit" disabled={isSubmitting} className="wwc:w-full">
				{isSubmitting ? (
					<>
						<Spinner className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Submitting...
					</>
				) : (
					"Subscribe"
				)}
			</Button>
		</form>
	);
}
