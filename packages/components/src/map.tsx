import {cn} from "@corensystem/core-utils";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as React from "react";

import {MAPBOX_TOKEN} from "./mapbox-token";

export interface MapProps extends React.HTMLAttributes<HTMLDivElement> {
	center?: [number, number];
	zoom?: number;
	style?: React.CSSProperties;
	mapStyle?: string;
}

// biome-ignore lint/suspicious/noShadowRestrictedNames: Map is the component name
/** Mapbox GL wrapper component for interactive maps. */
const Map = React.forwardRef<HTMLDivElement, MapProps>(
	(
		{className, center = [45.0792, 23.8859], zoom = 5, style, mapStyle = "mapbox://styles/mapbox/light-v11", ...props},
		ref,
	) => {
		const mapContainerRef = React.useRef<HTMLDivElement>(null);
		const mapRef = React.useRef<mapboxgl.Map | null>(null);

		React.useImperativeHandle(ref, () => mapContainerRef.current!);

		React.useEffect(() => {
			if (!mapContainerRef.current || mapRef.current) return;

			mapboxgl.accessToken = MAPBOX_TOKEN;

			mapRef.current = new mapboxgl.Map({
				container: mapContainerRef.current,
				style: mapStyle,
				center: center,
				zoom: zoom,
			});

			return () => {
				mapRef.current?.remove();
				mapRef.current = null;
			};
		}, []);

		React.useEffect(() => {
			if (mapRef.current) {
				mapRef.current.setCenter(center);
			}
		}, [center]);

		React.useEffect(() => {
			if (mapRef.current) {
				mapRef.current.setZoom(zoom);
			}
		}, [zoom]);

		React.useEffect(() => {
			if (mapRef.current) {
				mapRef.current.setStyle(mapStyle);
			}
		}, [mapStyle]);

		return (
			<div
				ref={mapContainerRef}
				className={cn("wwc:h-[400px] wwc:w-full wwc:rounded-lg wwc:overflow-hidden", className)}
				style={style}
				{...props}
			/>
		);
	},
);
Map.displayName = "Map";

export {Map};
