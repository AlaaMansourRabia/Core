/**
 * Avoid carousels without visible navigation.
 */
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@corensystem/coren-ui/carousel";
import {Card, CardContent} from "@corensystem/coren-ui/card";

export function NavigationDont() {
	return (
		<Carousel className="wwc:w-full wwc:max-w-xs">
			<CarouselContent>
				{Array.from({length: 5}).map((_, index) => (
					<CarouselItem key={index}>
						<Card>
							<CardContent className="wwc:flex wwc:aspect-video wwc:items-center wwc:justify-center wwc:p-6">
								<span className="wwc:text-2xl wwc:font-semibold">Slide {index + 1}</span>
							</CardContent>
						</Card>
					</CarouselItem>
				))}
			</CarouselContent>
			{/* No navigation buttons - users don't know they can swipe */}
		</Carousel>
	);
}
