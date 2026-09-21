export const IMPLEMENTATION_GOALS = [
	"product-ui",
	"core-showcase",
	"component-evaluation",
	"visual-reproduction",
] as const;

export type ImplementationGoal = (typeof IMPLEMENTATION_GOALS)[number];

const GOAL_SIGNALS: Array<{goal: ImplementationGoal; patterns: RegExp[]}> = [
	{
		goal: "core-showcase",
		patterns: [
			/\bwake\s*core\b.{0,32}\b(?:showcase|demo|demonstrat|test|try|explor|evaluat)/i,
			/\b(?:showcase|demo|demonstrat|test|try|explor|evaluat)\w*\b.{0,32}\bwake\s*core\b/i,
			/\bdesign[ -]?system showcase\b/i,
		],
	},
	{
		goal: "component-evaluation",
		patterns: [
			/\b(?:component|widget)s?\b.{0,28}\b(?:compar|evaluat|review|audit|test|benchmark)/i,
			/\b(?:compar|evaluat|review|audit|test|benchmark)\w*\b.{0,28}\b(?:component|widget)s?\b/i,
		],
	},
	{
		goal: "visual-reproduction",
		patterns: [
			/\b(?:recreat|reproduc|replicat|match|clone|copy)\w*\b.{0,36}\b(?:screenshot|image|mockup|design|reference|pixel)/i,
			/\b(?:pixel[ -]?perfect|visual reproduction|match (?:this|the) (?:design|screenshot))\b/i,
		],
	},
];

/** Infer a goal conservatively; ordinary application requests remain product UI. */
export function inferImplementationGoal(intent: string): ImplementationGoal {
	for (const signal of GOAL_SIGNALS) if (signal.patterns.some((pattern) => pattern.test(intent))) return signal.goal;
	return "product-ui";
}
