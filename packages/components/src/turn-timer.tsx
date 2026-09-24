import {cn} from "@corensystem/coren-utils";
import * as React from "react";

export interface TurnTimerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	/**
	 * When the turn started. Used to compute elapsed time. If omitted, the
	 * component uses its mount time. Re-render with the same value to preserve
	 * the count.
	 */
	startedAt?: Date | number;
	/** When true, the timer freezes at its current value and renders the dim "done" state. */
	done?: boolean;
	/** Override the displayed value (e.g. show a precomputed final duration). */
	value?: string;
	/** Tick interval in ms while live. Defaults to 100. */
	tickIntervalMs?: number;
}

const formatSeconds = (ms: number): string => `${(ms / 1000).toFixed(1)}s`;

/**
 * Mono-text duration counter. Live during work, frozen + de-emphasised when complete.
 * Sits as a footnote beneath the result it timed.
 */
export const TurnTimer = React.forwardRef<HTMLDivElement, TurnTimerProps>(
	({startedAt, done = false, value, tickIntervalMs = 100, className, ...props}, ref) => {
		const startMs = React.useMemo(() => {
			if (value !== undefined) return 0;
			if (startedAt instanceof Date) return startedAt.getTime();
			if (typeof startedAt === "number") return startedAt;
			return Date.now();
		}, [startedAt, value]);

		const [text, setText] = React.useState(() => value ?? formatSeconds(Date.now() - startMs));

		React.useEffect(() => {
			if (value !== undefined) {
				setText(value);
				return;
			}
			if (done) {
				setText(formatSeconds(Date.now() - startMs));
				return;
			}
			setText(formatSeconds(Date.now() - startMs));
			const interval = window.setInterval(() => {
				setText(formatSeconds(Date.now() - startMs));
			}, tickIntervalMs);
			return () => window.clearInterval(interval);
		}, [done, startMs, tickIntervalMs, value]);

		return (
			<div
				ref={ref}
				aria-hidden={done ? undefined : true}
				aria-label={done ? `Took ${text}` : undefined}
				className={cn(
					"wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:self-start wwc:px-0 wwc:py-0.5 wwc:text-[11px] wwc:text-muted-foreground",
					"wwc:font-mono",
					done && "wwc:opacity-70",
					className,
				)}
				{...props}
			>
				<span
					className={cn(
						"wwc:shrink-0 wwc:rounded-full",
						done
							? "wwc:h-1 wwc:w-1 wwc:bg-muted-foreground/50"
							: "wwc:h-2 wwc:w-2 wwc:border-[1.5px] wwc:border-muted-foreground wwc:border-t-transparent wwc:animate-spin wwc:[animation-duration:0.9s] wwc:motion-reduce:animate-none",
					)}
				/>
				<span>{text}</span>
			</div>
		);
	},
);
TurnTimer.displayName = "TurnTimer";
