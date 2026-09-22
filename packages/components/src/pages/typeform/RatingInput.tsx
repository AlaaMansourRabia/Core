import {cn} from "@core/core-utils";
// Star rating control — Core has no rating primitive, so this is a small purpose-built
// widget composed from lucide's Star + the repo's prefixed Tailwind utilities + cn. Keyboard-accessible
// (arrow keys / number keys), controlled via value/onChange.
import {Star} from "lucide-react";
import {useState} from "react";

export interface RatingInputProps {
	value?: number;
	onChange: (value: number) => void;
	max?: number;
	min?: number;
	disabled?: boolean;
	id?: string;
	autoFocus?: boolean;
	"aria-invalid"?: boolean;
}

export function RatingInput({
	value,
	onChange,
	max = 5,
	min = 1,
	disabled,
	id,
	autoFocus,
	"aria-invalid": ariaInvalid,
}: RatingInputProps) {
	const [hover, setHover] = useState<number | null>(null);
	const active = hover ?? value ?? 0;
	const stars = Array.from({length: max - min + 1}, (_, i) => min + i);

	return (
		<div
			id={id}
			role="radiogroup"
			aria-invalid={ariaInvalid}
			className="wwc:flex wwc:items-center wwc:gap-2"
			onMouseLeave={() => setHover(null)}
		>
			{stars.map((n, index) => {
				const filled = n <= active;
				return (
					<button
						key={n}
						type="button"
						role="radio"
						aria-checked={value === n}
						aria-label={`${n} star${n === 1 ? "" : "s"}`}
						disabled={disabled}
						autoFocus={autoFocus && index === 0}
						onMouseEnter={() => setHover(n)}
						onClick={() => onChange(n)}
						onKeyDown={(e) => {
							if (e.key === "ArrowRight" || e.key === "ArrowUp") {
								e.preventDefault();
								onChange(Math.min(max, (value ?? min - 1) + 1));
							} else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
								e.preventDefault();
								onChange(Math.max(min, (value ?? min + 1) - 1));
							} else if (/^[0-9]$/.test(e.key)) {
								const num = Number(e.key);
								if (num >= min && num <= max) {
									e.preventDefault();
									onChange(num);
								}
							}
						}}
						className={cn(
							"wwc:rounded-md wwc:p-1 wwc:transition-colors",
							"wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring",
							disabled ? "wwc:cursor-not-allowed wwc:opacity-50" : "wwc:cursor-pointer",
						)}
					>
						<Star
							className={cn(
								"wwc:size-7 wwc:transition-colors",
								filled ? "wwc:fill-amber-400 wwc:text-amber-400" : "wwc:fill-transparent wwc:text-muted-foreground",
							)}
						/>
					</button>
				);
			})}
			{value != null ? (
				<span className="wwc:ml-1 wwc:text-sm wwc:text-muted-foreground wwc:tabular-nums">
					{value}/{max}
				</span>
			) : null}
		</div>
	);
}
