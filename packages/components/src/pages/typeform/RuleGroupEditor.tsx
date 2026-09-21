// A reusable editor for a single `RuleGroup`, restyled for a narrow (~300px) side panel.
// Each condition's controls STACK vertically instead of sitting on one wide row, so the whole
// thing fits the question inspector's aside. Edits are immutable — every change routes through
// `onChange` with a fresh RuleGroup. Rule editors may only reference EARLIER questions; the caller
// supplies that list (via `earlierQuestions`) so this component never has to know the schema.
import {Plus, Trash2} from "lucide-react";

import {Button} from "../../button";
import {Input} from "../../input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../select";
import {makeCondition} from "./model";
import type {Condition, ConditionOperator, Question, RuleGroup} from "./model";

/** Sentinel Select value — Radix Select forbids empty-string item values. */
const NONE = "__none__";

const OPERATORS: {value: ConditionOperator; label: string}[] = [
	{value: "eq", label: "is"},
	{value: "neq", label: "is not"},
	{value: "answered", label: "is answered"},
	{value: "not_answered", label: "is not answered"},
	{value: "includes", label: "includes"},
	{value: "gt", label: "greater than"},
	{value: "lt", label: "less than"},
];

/** Operators that don't take a compare value. */
function operatorHasValue(op: ConditionOperator): boolean {
	return op !== "answered" && op !== "not_answered";
}

export function RuleGroupEditor({
	rule,
	earlier,
	onChange,
}: {
	rule: RuleGroup;
	earlier: Question[];
	onChange: (r: RuleGroup) => void;
}): JSX.Element {
	function setCondition(index: number, patch: Partial<Condition>) {
		onChange({
			...rule,
			conditions: rule.conditions.map((c, i) => (i === index ? {...c, ...patch} : c)),
		});
	}

	function removeCondition(index: number) {
		onChange({...rule, conditions: rule.conditions.filter((_, i) => i !== index)});
	}

	function addCondition() {
		const first = earlier[0];
		if (!first) return;
		onChange({...rule, conditions: [...rule.conditions, makeCondition(first.id)]});
	}

	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/30 wwc:p-2">
			{/* Match all | any */}
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<span className="wwc:text-xs wwc:text-muted-foreground">Match</span>
				<Select value={rule.match} onValueChange={(v) => onChange({...rule, match: v as RuleGroup["match"]})}>
					<SelectTrigger className="wwc:h-7 wwc:w-20">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">all</SelectItem>
						<SelectItem value="any">any</SelectItem>
					</SelectContent>
				</Select>
				<span className="wwc:text-xs wwc:text-muted-foreground">of:</span>
			</div>

			{rule.conditions.map((condition, index) => {
				const ref = earlier.find((q) => q.id === condition.questionId);
				const refIsChoice = ref?.type === "multiple_choice";
				const hasValue = operatorHasValue(condition.operator);
				const valueStr = condition.value === undefined ? "" : String(condition.value);
				return (
					// Narrow layout: every control is full-width and stacked, one per line.
					<div
						key={index}
						className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:rounded wwc:border wwc:border-border wwc:bg-background wwc:p-2"
					>
						<div className="wwc:flex wwc:items-center wwc:justify-between">
							<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">When</span>
							<Button
								icon
								size="sm"
								variant="ghost"
								tooltip="Remove condition"
								aria-label="Remove condition"
								onClick={() => removeCondition(index)}
							>
								<Trash2 />
							</Button>
						</div>

						{/* Earlier-question reference */}
						<Select value={condition.questionId} onValueChange={(v) => setCondition(index, {questionId: v, value: ""})}>
							<SelectTrigger className="wwc:h-7 wwc:w-full wwc:min-w-0">
								<SelectValue placeholder="Question" />
							</SelectTrigger>
							<SelectContent>
								{earlier.map((q) => (
									<SelectItem key={q.id} value={q.id}>
										{q.label || "Untitled question"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Operator */}
						<Select
							value={condition.operator}
							onValueChange={(v) => setCondition(index, {operator: v as ConditionOperator})}
						>
							<SelectTrigger className="wwc:h-7 wwc:w-full wwc:min-w-0">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{OPERATORS.map((op) => (
									<SelectItem key={op.value} value={op.value}>
										{op.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Compare value — hidden for answered / not_answered */}
						{hasValue &&
							(refIsChoice ? (
								<Select
									value={valueStr === "" ? NONE : valueStr}
									onValueChange={(v) => setCondition(index, {value: v === NONE ? "" : v})}
								>
									<SelectTrigger className="wwc:h-7 wwc:w-full wwc:min-w-0">
										<SelectValue placeholder="Value" />
									</SelectTrigger>
									<SelectContent>
										{(ref?.options ?? []).map((opt) => (
											<SelectItem key={opt.id} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							) : (
								<Input
									className="wwc:h-7 wwc:w-full wwc:min-w-0"
									aria-label="Compare value"
									placeholder="Value"
									value={valueStr}
									onChange={(e) => setCondition(index, {value: e.target.value})}
								/>
							))}
					</div>
				);
			})}

			<Button
				variant="outline"
				size="sm"
				className="wwc:h-7 wwc:w-full"
				onClick={addCondition}
				disabled={earlier.length === 0}
			>
				<Plus />
				Add condition
			</Button>
		</div>
	);
}
