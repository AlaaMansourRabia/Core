/**
 * Avoid carousels without position context.
 */
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@corensystem/coren-ui/carousel";
import {Card, CardContent} from "@corensystem/coren-ui/card";

export function IndicatorDont() {
	return (
		<Carousel className="wwc:w-full wwc:max-w-xs">
			<CarouselContent>
				{Array.from({length: 10}).map((_, index) => (
					<CarouselItem key={index}>
						<Card>
							<CardContent className="wwc:flex wwc:aspect-video wwc:items-center wwc:justify-center wwc:p-6">
								<span className="wwc:text-2xl wwc:font-semibold">Slide {index + 1}</span>
							</CardContent>
						</Card>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
			{/* No indicator - user doesn't know how many slides or current position */}
		</Carousel>
	);
}
