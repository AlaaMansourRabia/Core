import {Card, CardContent} from "@corensystem/coren-ui/card";
/**
 * Vertical carousel orientation.
 */
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@corensystem/coren-ui/carousel";

export function Vertical() {
	return (
		<Carousel
			opts={{
				align: "start",
			}}
			orientation="vertical"
			className="wwc:w-full wwc:max-w-xs"
		>
			<CarouselContent className="wwc:-mt-1 wwc:h-52">
				{Array.from({length: 5}).map((_, index) => (
					<CarouselItem key={index} className="wwc:pt-1 wwc:basis-1/2">
						<div className="wwc:p-1">
							<Card>
								<CardContent className="wwc:flex wwc:items-center wwc:justify-center wwc:p-6">
									<span className="wwc:text-3xl wwc:font-semibold">{index + 1}</span>
								</CardContent>
							</Card>
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	);
}
