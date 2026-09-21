import {Layers, Loader2, LocateFixed, MapPin, Search, Settings2, X} from "lucide-react";
import mapboxgl from "mapbox-gl";
import {useCallback, useEffect, useRef, useState} from "react";

import {Button} from "./button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "./dropdown-menu";
import {Input} from "./input";
import {Label} from "./label";
import {MAPBOX_TOKEN} from "./mapbox-token";
import {ScrollArea} from "./scroll-area";
import {Switch} from "./switch";

const mapStyles = [
	{value: "mapbox://styles/mapbox/light-v11", label: "Light"},
	{value: "mapbox://styles/mapbox/dark-v11", label: "Dark"},
	{value: "mapbox://styles/mapbox/streets-v12", label: "Streets"},
	{value: "mapbox://styles/mapbox/outdoors-v12", label: "Outdoors"},
	{value: "mapbox://styles/mapbox/satellite-v9", label: "Satellite"},
	{value: "mapbox://styles/mapbox/satellite-streets-v12", label: "Satellite Streets"},
	{value: "mapbox://styles/mapbox/navigation-day-v1", label: "Navigation Day"},
	{value: "mapbox://styles/mapbox/navigation-night-v1", label: "Navigation Night"},
	{value: "mapbox://styles/mapbox/standard", label: "Standard"},
	{value: "mapbox://styles/mapbox/standard-satellite", label: "Standard Satellite"},
];

interface SearchResult {
	id: string;
	place_name: string;
	center: [number, number];
}

interface SettingsToggle {
	id: string;
	label: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}

interface MapControlsProps {
	mapRef: React.MutableRefObject<mapboxgl.Map | null>;
	mapStyle: string;
	onMapStyleChange: (style: string) => void;
	additionalControls?: React.ReactNode;
	additionalSettings?: SettingsToggle[];
}

/** Map controls overlay with style selector, location search, and settings panel. */
export function MapControls({
	mapRef,
	mapStyle,
	onMapStyleChange,
	additionalControls,
	additionalSettings,
}: MapControlsProps) {
	const markerRef = useRef<mapboxgl.Marker | null>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [isLocating, setIsLocating] = useState(false);
	const [showMapType, setShowMapType] = useState(true);
	const [showMyLocation, setShowMyLocation] = useState(true);
	const [showSearch, setShowSearch] = useState(true);

	const searchLocations = useCallback(async (query: string) => {
		if (!query.trim()) {
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		try {
			const response = await fetch(
				`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5&types=place,locality,address,poi`,
			);
			const data = await response.json();
			setSearchResults(
				data.features?.map((feature: {id: string; place_name: string; center: [number, number]}) => ({
					id: feature.id,
					place_name: feature.place_name,
					center: feature.center,
				})) || [],
			);
		} catch (error) {
			console.error("Search wwc:error:", error);
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	}, []);

	useEffect(() => {
		if (!isSearchFocused) return;

		const debounceTimer = setTimeout(() => {
			searchLocations(searchQuery);
		}, 300);

		return () => clearTimeout(debounceTimer);
	}, [searchQuery, searchLocations, isSearchFocused]);

	const selectLocation = (result: SearchResult) => {
		setSearchQuery(result.place_name);
		setShowResults(false);
		setSearchResults([]);
		setIsSearchFocused(false);
		searchInputRef.current?.blur();

		if (mapRef.current) {
			markerRef.current?.remove();

			markerRef.current = new mapboxgl.Marker({color: "#f97316"}).setLngLat(result.center).addTo(mapRef.current);

			mapRef.current.flyTo({
				center: result.center,
				zoom: 12,
				duration: 1500,
			});
		}
	};

	const clearSearch = () => {
		setSearchQuery("");
		setSearchResults([]);
		setShowResults(false);
		setIsSearchFocused(false);
		markerRef.current?.remove();
		markerRef.current = null;
	};

	const handleSearchFocus = () => {
		setIsSearchFocused(true);
		if (searchResults.length > 0) {
			setShowResults(true);
		}
	};

	const handleSearchBlur = () => {
		setTimeout(() => {
			setShowResults(false);
		}, 200);
	};

	const locateUser = () => {
		if (!navigator.geolocation) return;

		setIsLocating(true);

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const {latitude, longitude} = position.coords;
				setIsLocating(false);

				if (mapRef.current) {
					markerRef.current?.remove();

					const el = document.createElement("div");
					el.innerHTML = `
            <div style="
              width: 16px;
              height: 16px;
              background: #3b82f6;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 0 0 rgba(59, 130, 246, 0.4);
              animation: pulse 2s infinite;
            "></div>
            <style>
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
              }
            </style>
          `;

					markerRef.current = new mapboxgl.Marker(el).setLngLat([longitude, latitude]).addTo(mapRef.current);

					mapRef.current.flyTo({
						center: [longitude, latitude],
						zoom: 14,
						duration: 1500,
					});

					setSearchQuery("");
				}
			},
			() => {
				setIsLocating(false);
			},
			{enableHighAccuracy: true, timeout: 10000},
		);
	};

	return (
		<div className="wwc:absolute wwc:top-3 wwc:left-3 wwc:flex wwc:gap-1 wwc:z-10">
			{/* Settings */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" icon className="wwc:bg-card">
						<Settings2 className="wwc:h-4 wwc:w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="wwc:w-48 wwc:p-3 wwc:space-y-3">
					<div className="wwc:flex wwc:items-center wwc:justify-between">
						<Label htmlFor="show-map-type" className="wwc:text-xs">
							Map Type
						</Label>
						<Switch id="show-map-type" checked={showMapType} onCheckedChange={setShowMapType} />
					</div>
					<div className="wwc:flex wwc:items-center wwc:justify-between">
						<Label htmlFor="show-location" className="wwc:text-xs">
							My Location
						</Label>
						<Switch id="show-location" checked={showMyLocation} onCheckedChange={setShowMyLocation} />
					</div>
					<div className="wwc:flex wwc:items-center wwc:justify-between">
						<Label htmlFor="show-search" className="wwc:text-xs">
							Search
						</Label>
						<Switch id="show-search" checked={showSearch} onCheckedChange={setShowSearch} />
					</div>
					{additionalSettings?.map((setting) => (
						<div key={setting.id} className="wwc:flex wwc:items-center wwc:justify-between">
							<Label htmlFor={setting.id} className="wwc:text-xs">
								{setting.label}
							</Label>
							<Switch id={setting.id} checked={setting.checked} onCheckedChange={setting.onCheckedChange} />
						</div>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Map Type Selector */}
			{showMapType && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" icon className="wwc:bg-card">
							<Layers className="wwc:h-4 wwc:w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="wwc:w-44 wwc:p-0">
						<ScrollArea className="wwc:h-[180px]">
							<DropdownMenuRadioGroup value={mapStyle} onValueChange={onMapStyleChange} className="wwc:p-1">
								{mapStyles.map((style) => (
									<DropdownMenuRadioItem key={style.value} value={style.value} className="wwc:text-xs">
										{style.label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</ScrollArea>
					</DropdownMenuContent>
				</DropdownMenu>
			)}

			{/* My Location Button */}
			{showMyLocation && (
				<Button variant="outline" icon className="wwc:bg-card" onClick={locateUser} disabled={isLocating}>
					{isLocating ? (
						<Loader2 className="wwc:h-4 wwc:w-4 wwc:animate-spin" />
					) : (
						<LocateFixed className="wwc:h-4 wwc:w-4" />
					)}
				</Button>
			)}

			{/* Additional Controls */}
			{additionalControls}

			{/* Search Box */}
			{showSearch && (
				<div className="wwc:relative wwc:w-48">
					<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:-translate-y-1/2 wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
					<Input
						ref={searchInputRef}
						placeholder="Search..."
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							if (e.target.value && isSearchFocused) {
								setShowResults(true);
							}
						}}
						onFocus={handleSearchFocus}
						onBlur={handleSearchBlur}
						className="wwc:pl-8 wwc:pr-7 wwc:h-8 wwc:bg-card wwc:text-xs"
					/>
					{searchQuery && (
						<Button
							variant="ghost"
							icon
							onClick={clearSearch}
							className="wwc:absolute wwc:right-0.5 wwc:top-1/2 wwc:-translate-y-1/2 wwc:h-6 wwc:w-6"
						>
							<X className="wwc:h-3 wwc:w-3" />
						</Button>
					)}

					{/* Search Results Dropdown */}
					{showResults && isSearchFocused && searchResults.length > 0 && (
						<div className="wwc:absolute wwc:top-full wwc:left-0 wwc:mt-1 wwc:w-64 wwc:bg-card wwc:border wwc:rounded-md wwc:shadow-lg wwc:z-10">
							<ScrollArea className="wwc:h-[180px]">
								{searchResults.map((result) => (
									<button
										key={result.id}
										onClick={() => selectLocation(result)}
										className="wwc:w-full wwc:flex wwc:items-start wwc:gap-2 wwc:px-3 wwc:py-2 wwc:text-left wwc:text-xs wwc:hover:bg-accent wwc:transition-colors"
									>
										<MapPin className="wwc:h-3.5 wwc:w-3.5 wwc:mt-0.5 wwc:shrink-0 wwc:text-muted-foreground" />
										<span className="wwc:line-clamp-2">{result.place_name}</span>
									</button>
								))}
							</ScrollArea>
						</div>
					)}

					{isSearching && isSearchFocused && (
						<div className="wwc:absolute wwc:top-full wwc:left-0 wwc:mt-1 wwc:w-64 wwc:bg-card wwc:border wwc:rounded-md wwc:p-2 wwc:text-xs wwc:text-muted-foreground">
							Searching...
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export {mapStyles, MAPBOX_TOKEN};
