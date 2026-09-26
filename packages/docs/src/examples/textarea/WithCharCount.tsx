/**
 * Textarea with character count indicator.
 */
import {Textarea} from "@corensystem/coren-ui/textarea";
import {Label} from "@corensystem/coren-ui/label";
import * as React from "react";

export function WithCharCount() {
	const [value, setValue] = React.useState("");
	const maxLength = 280;

	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:max-w-md">
			<Label htmlFor="textarea-count">Message</Label>
			<Textarea
				id="textarea-count"
				placeholder="What's happening?"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				maxLength={maxLength}
			/>
			<p className="wwc:text-xs wwc:text-muted-foreground wwc:text-right">
				{value.length}/{maxLength}
			</p>
		</div>
	);
}
