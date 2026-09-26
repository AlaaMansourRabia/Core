import {Card, CardContent} from "@corensystem/coren-ui/card";
/**
 * Avoid hiding critical content in carousels.
 */
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@corensystem/coren-ui/carousel";
import {AlertTriangle} from "lucide-react";

export function ContentDont() {
	return (
		<Carousel className="wwc:w-full wwc:max-w-sm">
			<CarouselContent>
				{/* Important safety warnings hidden in carousel - bad UX */}
				<CarouselItem>
					<Card className="wwc:border-destructive">
						<CardContent className="wwc:p-4">
							<div className="wwc:flex wwc:items-start wwc:gap-2">
								<AlertTriangle className="wwc:h-5 wwc:w-5 wwc:text-destructive" />
								<div>
									<p className="wwc:font-semibold">Warning 1</p>
									<p className="wwc:text-sm">Do not operate near water</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</CarouselItem>
				<CarouselItem>
					<Card className="wwc:border-destructive">
						<CardContent className="wwc:p-4">
							<div className="wwc:flex wwc:items-start wwc:gap-2">
								<AlertTriangle className="wwc:h-5 wwc:w-5 wwc:text-destructive" />
								<div>
									<p className="wwc:font-semibold">Warning 2</p>
									<p className="wwc:text-sm">Keep away from children</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</CarouselItem>
				<CarouselItem>
					<Card className="wwc:border-destructive">
						<CardContent className="wwc:p-4">
							<div className="wwc:flex wwc:items-start wwc:gap-2">
								<AlertTriangle className="wwc:h-5 wwc:w-5 wwc:text-destructive" />
								<div>
									<p className="wwc:font-semibold">Warning 3</p>
									<p className="wwc:text-sm">May cause electrical shock</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</CarouselItem>
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	);
}
