import {cn} from "@wakecap/core-utils";
import useEmblaCarousel, {type UseEmblaCarouselType} from "embla-carousel-react";
import {ArrowLeft, ArrowRight} from "lucide-react";
import * as React from "react";

import {Button} from "./button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
	opts?: CarouselOptions;
	plugins?: CarouselPlugin;
	orientation?: "horizontal" | "vertical";
	setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
	carouselRef: ReturnType<typeof useEmblaCarousel>[0];
	api: ReturnType<typeof useEmblaCarousel>[1];
	scrollPrev: () => void;
	scrollNext: () => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
	const context = React.useContext(CarouselContext);

	if (!context) {
		throw new Error("useCarousel must be used within a <Carousel />");
	}

	return context;
}

/** Carousel built on Embla with swipe support, keyboard navigation, and autoplay. */
const Carousel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & CarouselProps>(
	({orientation = "horizontal", opts, setApi, plugins, className, children, ...props}, ref) => {
		const [carouselRef, api] = useEmblaCarousel(
			{
				...opts,
				axis: orientation === "horizontal" ? "x" : "y",
			},
			plugins,
		);
		const [canScrollPrev, setCanScrollPrev] = React.useState(false);
		const [canScrollNext, setCanScrollNext] = React.useState(false);

		const onSelect = React.useCallback((api: CarouselApi) => {
			if (!api) {
				return;
			}

			setCanScrollPrev(api.canScrollPrev());
			setCanScrollNext(api.canScrollNext());
		}, []);

		const scrollPrev = React.useCallback(() => {
			api?.scrollPrev();
		}, [api]);

		const scrollNext = React.useCallback(() => {
			api?.scrollNext();
		}, [api]);

		const handleKeyDown = React.useCallback(
			(event: React.KeyboardEvent<HTMLDivElement>) => {
				if (event.key === "ArrowLeft") {
					event.preventDefault();
					scrollPrev();
				} else if (event.key === "ArrowRight") {
					event.preventDefault();
					scrollNext();
				}
			},
			[scrollPrev, scrollNext],
		);

		React.useEffect(() => {
			if (!api || !setApi) {
				return;
			}

			setApi(api);
		}, [api, setApi]);

		React.useEffect(() => {
			if (!api) {
				return;
			}

			onSelect(api);
			api.on("reInit", onSelect);
			api.on("select", onSelect);

			return () => {
				api?.off("select", onSelect);
			};
		}, [api, onSelect]);

		return (
			<CarouselContext.Provider
				value={{
					carouselRef,
					api: api,
					opts,
					orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
					scrollPrev,
					scrollNext,
					canScrollPrev,
					canScrollNext,
				}}
			>
				<div
					ref={ref}
					onKeyDownCapture={handleKeyDown}
					className={cn("wwc:relative", className)}
					role="region"
					aria-roledescription="carousel"
					{...props}
				>
					{children}
				</div>
			</CarouselContext.Provider>
		);
	},
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => {
		const {carouselRef, orientation} = useCarousel();

		return (
			<div ref={carouselRef} className="wwc:overflow-hidden">
				<div
					ref={ref}
					className={cn("wwc:flex", orientation === "horizontal" ? "wwc:-ml-4" : "wwc:-mt-4 wwc:flex-col", className)}
					{...props}
				/>
			</div>
		);
	},
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => {
		const {orientation} = useCarousel();

		return (
			<div
				ref={ref}
				role="group"
				aria-roledescription="slide"
				className={cn(
					"wwc:min-w-0 wwc:shrink-0 wwc:grow-0 wwc:basis-full",
					orientation === "horizontal" ? "wwc:pl-4" : "wwc:pt-4",
					className,
				)}
				{...props}
			/>
		);
	},
);
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
	({className, variant = "outline", size, icon = true, ...props}, ref) => {
		const {orientation, scrollPrev, canScrollPrev} = useCarousel();

		return (
			<Button
				ref={ref}
				variant={variant}
				size={size}
				icon={icon}
				className={cn(
					"wwc:absolute  wwc:h-8 wwc:w-8 wwc:rounded-full",
					orientation === "horizontal"
						? "wwc:-left-12 wwc:top-1/2 wwc:-translate-y-1/2"
						: "wwc:-top-12 wwc:left-1/2 wwc:-translate-x-1/2 wwc:rotate-90",
					className,
				)}
				disabled={!canScrollPrev}
				onClick={scrollPrev}
				{...props}
			>
				<ArrowLeft className="wwc:h-4 wwc:w-4" />
				<span className="wwc:sr-only">Previous slide</span>
			</Button>
		);
	},
);
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
	({className, variant = "outline", size, icon = true, ...props}, ref) => {
		const {orientation, scrollNext, canScrollNext} = useCarousel();

		return (
			<Button
				ref={ref}
				variant={variant}
				size={size}
				icon={icon}
				className={cn(
					"wwc:absolute wwc:h-8 wwc:w-8 wwc:rounded-full",
					orientation === "horizontal"
						? "wwc:-right-12 wwc:top-1/2 wwc:-translate-y-1/2"
						: "wwc:-bottom-12 wwc:left-1/2 wwc:-translate-x-1/2 wwc:rotate-90",
					className,
				)}
				disabled={!canScrollNext}
				onClick={scrollNext}
				{...props}
			>
				<ArrowRight className="wwc:h-4 wwc:w-4" />
				<span className="wwc:sr-only">Next slide</span>
			</Button>
		);
	},
);
CarouselNext.displayName = "CarouselNext";

export {type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext};
