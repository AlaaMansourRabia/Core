import {cn} from "@corensystem/core-utils";
import {Check} from "lucide-react";
import * as React from "react";

type StepperOrientation = "horizontal" | "vertical";
type StepperItemState = "completed" | "current" | "upcoming";

type StepperContextValue = {
	value: number;
	orientation: StepperOrientation;
};

const StepperContext = React.createContext<StepperContextValue | null>(null);

const useStepper = () => {
	const ctx = React.useContext(StepperContext);
	if (!ctx) {
		throw new Error("Stepper subcomponents must be used within <Stepper>");
	}
	return ctx;
};

type StepperItemContextValue = {
	step: number;
	state: StepperItemState;
};

const StepperItemContext = React.createContext<StepperItemContextValue | null>(null);

const useStepperItem = () => {
	const ctx = React.useContext(StepperItemContext);
	if (!ctx) {
		throw new Error("StepperItem subcomponents must be used within <StepperItem>");
	}
	return ctx;
};

/** Vertical or horizontal step indicator for multi-step flows (wizards, forms in dialogs, onboarding). */
const Stepper = React.forwardRef<
	HTMLDivElement,
	React.ComponentPropsWithoutRef<"div"> & {
		value: number;
		orientation?: StepperOrientation;
	}
>(({value, orientation = "vertical", className, children, ...props}, ref) => (
	<StepperContext.Provider value={{value, orientation}}>
		<div
			ref={ref}
			role="group"
			aria-label="Progress"
			data-orientation={orientation}
			className={cn(orientation === "vertical" ? "wwc:flex wwc:flex-col" : "wwc:flex wwc:flex-row", className)}
			{...props}
		>
			{children}
		</div>
	</StepperContext.Provider>
));
Stepper.displayName = "Stepper";

const StepperList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
	({className, ...props}, ref) => {
		const {orientation} = useStepper();
		return (
			<ol
				ref={ref}
				data-orientation={orientation}
				className={cn(
					orientation === "vertical"
						? "wwc:flex wwc:flex-col wwc:gap-3"
						: "wwc:flex wwc:flex-row wwc:items-center wwc:gap-2",
					className,
				)}
				{...props}
			/>
		);
	},
);
StepperList.displayName = "StepperList";

const StepperItem = React.forwardRef<
	HTMLLIElement,
	React.ComponentPropsWithoutRef<"li"> & {
		step: number;
	}
>(({step, className, children, ...props}, ref) => {
	const {value, orientation} = useStepper();
	const state: StepperItemState = step < value ? "completed" : step === value ? "current" : "upcoming";

	return (
		<StepperItemContext.Provider value={{step, state}}>
			<li
				ref={ref}
				data-state={state}
				data-orientation={orientation}
				aria-current={state === "current" ? "step" : undefined}
				className={cn(
					orientation === "vertical" ? "wwc:flex wwc:items-center wwc:gap-3" : "wwc:flex wwc:items-center wwc:gap-2",
					className,
				)}
				{...props}
			>
				{children}
			</li>
		</StepperItemContext.Provider>
	);
});
StepperItem.displayName = "StepperItem";

const StepperIndicator = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
	({className, children, ...props}, ref) => {
		const {step, state} = useStepperItem();
		const isUpcoming = state === "upcoming";
		const isCompleted = state === "completed";

		return (
			<div
				ref={ref}
				aria-hidden="true"
				data-state={state}
				className={cn(
					"wwc:flex wwc:h-7 wwc:w-7 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-full wwc:text-xs wwc:font-semibold wwc:transition-colors",
					isUpcoming ? "wwc:bg-muted wwc:text-muted-foreground" : "wwc:bg-primary wwc:text-primary-foreground",
					className,
				)}
				{...props}
			>
				{children ?? (isCompleted ? <Check className="wwc:h-4 wwc:w-4" strokeWidth={3} /> : step)}
			</div>
		);
	},
);
StepperIndicator.displayName = "StepperIndicator";

const StepperLabel = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
	({className, ...props}, ref) => {
		const {state} = useStepperItem();
		const isUpcoming = state === "upcoming";

		return (
			<span
				ref={ref}
				data-state={state}
				className={cn(
					"wwc:text-sm wwc:font-semibold wwc:leading-none",
					isUpcoming ? "wwc:text-muted-foreground" : "wwc:text-foreground",
					className,
				)}
				{...props}
			/>
		);
	},
);
StepperLabel.displayName = "StepperLabel";

const StepperDescription = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
	({className, ...props}, ref) => (
		<span ref={ref} className={cn("wwc:text-xs wwc:text-muted-foreground wwc:leading-tight", className)} {...props} />
	),
);
StepperDescription.displayName = "StepperDescription";

const StepperSeparator = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
	({className, ...props}, ref) => {
		const {orientation} = useStepper();
		return (
			<div
				ref={ref}
				role="presentation"
				aria-hidden="true"
				data-orientation={orientation}
				className={cn(
					"wwc:bg-border",
					orientation === "vertical" ? "wwc:ml-3.5 wwc:h-6 wwc:w-px" : "wwc:h-px wwc:flex-1",
					className,
				)}
				{...props}
			/>
		);
	},
);
StepperSeparator.displayName = "StepperSeparator";

export {Stepper, StepperList, StepperItem, StepperIndicator, StepperLabel, StepperDescription, StepperSeparator};
