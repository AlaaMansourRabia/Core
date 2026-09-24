/**
 * Avoid custom dropdowns without proper keyboard support.
 */
import * as React from "react";
import {ChevronsUpDown} from "lucide-react";
import {Button} from "@corensystem/coren-ui/button";

const options = [
	{value: "draft", label: "Draft"},
	{value: "published", label: "Published"},
	{value: "archived", label: "Archived"},
];

export function KeyboardDont() {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");

	return (
		<div className="wwc:relative wwc:w-48">
			{/* Custom dropdown without ARIA or keyboard support */}
			<Button
				variant="outline"
				className="wwc:w-full wwc:justify-between"
				onClick={() => setOpen(!open)}
			>
				{value ? options.find((o) => o.value === value)?.label : "Select status..."}
				<ChevronsUpDown className="wwc:ml-2 wwc:h-4 wwc:w-4 wwc:opacity-50" />
			</Button>
			{open && (
				<div className="wwc:absolute wwc:top-full wwc:mt-1 wwc:w-full wwc:rounded-md wwc:border wwc:bg-popover wwc:p-1 wwc:shadow-md">
					{options.map((option) => (
						<div
							key={option.value}
							className="wwc:cursor-pointer wwc:rounded-sm wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:hover:bg-accent"
							onClick={() => {
								setValue(option.value);
								setOpen(false);
							}}
						>
							{option.label}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
