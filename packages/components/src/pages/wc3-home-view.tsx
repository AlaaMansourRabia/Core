import type {ReactElement} from "react";

import {ArrowRight} from "lucide-react";

import {Badge} from "../badge";
import {Card} from "../card";

// The Products perspective's landing surface: one card per other perspective, so the workspace opens
// on a map of itself rather than on whichever perspective happened to be first.
//
// The cards are DERIVED from the shell's PERSPECTIVES array rather than restated here. A perspective
// added, renamed or removed in the shell changes this page with it; there is no second list to keep
// in step, and a card can never advertise a surface that does not exist.

export type Wc3HomeCard = {
	id: string;
	label: string;
	icon: React.ComponentType<{className?: string}>;
	/**
	 * The perspective's own tabs, shown as what you will find inside it. `badge` is whatever the shell
	 * already computed for that tab — a count, or a string.
	 */
	tabs: {id: string; label: string; badge?: string | number}[];
};

export function HomeView({cards, onOpen}: {cards: Wc3HomeCard[]; onOpen: (id: string) => void}): ReactElement {
	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:gap-4 wwc:overflow-auto wwc:px-6 wwc:pb-6 wwc:pt-4">
			<div className="wwc:grid wwc:gap-4 wwc:sm:grid-cols-2 wwc:xl:grid-cols-3">
				{cards.map((card) => {
					const Icon = card.icon;
					const open = () => onOpen(card.id);
					return (
						// role="button" rather than a real <button>: the card holds badges and a chip list, and
						// nesting those in a button is invalid. Enter/Space are wired by hand, as the product
						// catalogue's cards do.
						<Card
							key={card.id}
							role="button"
							tabIndex={0}
							data-home-card={card.id}
							title={`Open ${card.label}`}
							onClick={open}
							onKeyDown={(event) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									open();
								}
							}}
							className="wwc:group wwc:flex wwc:cursor-pointer wwc:flex-col wwc:gap-3 wwc:p-4 wwc:transition-colors wwc:hover:border-primary/50 wwc:hover:bg-accent/40"
						>
							<div className="wwc:flex wwc:items-center wwc:gap-2.5">
								<span className="wwc:flex wwc:h-9 wwc:w-9 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:bg-muted wwc:text-foreground">
									<Icon className="wwc:h-4 wwc:w-4" />
								</span>
								<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-sm wwc:font-semibold">{card.label}</span>
								<ArrowRight className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-muted-foreground wwc:transition-transform wwc:group-hover:translate-x-0.5" />
							</div>

							{/* What is inside, in the perspective's own words — its tab labels, with whatever counts
							    the shell already computed for them. Nothing invented. */}
							<div className="wwc:flex wwc:flex-wrap wwc:gap-1">
								{card.tabs.map((tab) => (
									<Badge key={tab.id} variant="neutralSoft" className="wwc:font-normal">
										{tab.label}
										{tab.badge === undefined ? null : (
											<span className="wwc:ml-1 wwc:tabular-nums wwc:text-muted-foreground">{tab.badge}</span>
										)}
									</Badge>
								))}
							</div>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
