import {cn} from "@corensystem/coren-utils";
import {Calendar, Camera, Download, Eye, Plane, Play, RefreshCw, Search, Video, X} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {useEffect, useRef, useState} from "react";

import {AssetListItem} from "../asset-list-item";
import {Badge} from "../badge";
import {Button} from "../button";
import {Input} from "../input";
import {MapControls} from "../map-controls";
import {MAPBOX_TOKEN} from "../mapbox-token";
import {ScrollArea} from "../scroll-area";
import {Tabs, TabsList, TabsTrigger} from "../tabs";
import type {Organization} from "../types";

interface OrgRealityCaptureProps {
	selectedOrg: Organization;
}

// Camera thumbnail images (cycle through these)
const cameraThumbnails = [
	"/images/camera-01.jpeg",
	"/images/camera-02.jpg",
	"/images/camera-03.jpg",
	"/images/camera-04.png",
	"/images/camera-05.webp",
	"/images/camera-06.jpg",
	"/images/camera-07.gif",
];

// Mock data for live camera feeds with actual Qiddiya coordinates
const liveCameraData = [
	// Six Flags - 6 cameras (around 46.377, 24.547)
	{
		id: 1,
		project: "Six Flags",
		cameraName: "Main Entrance - CAM01",
		location: "Gate A",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[0],
		coordinates: [46.3765, 24.546] as [number, number],
	},
	{
		id: 2,
		project: "Six Flags",
		cameraName: "Roller Coaster Site - CAM02",
		location: "Zone B",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[1],
		coordinates: [46.3775, 24.5475] as [number, number],
	},
	{
		id: 3,
		project: "Six Flags",
		cameraName: "Falcon's Flight Tower - CAM03",
		location: "Zone C",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[2],
		coordinates: [46.378, 24.548] as [number, number],
	},
	{
		id: 4,
		project: "Six Flags",
		cameraName: "Steel Structure Assembly - CAM04",
		location: "Zone D",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[3],
		coordinates: [46.3785, 24.5465] as [number, number],
	},
	{
		id: 5,
		project: "Six Flags",
		cameraName: "Parking Area - CAM05",
		location: "West Lot",
		status: "offline",
		lastUpdate: "1 hour ago",
		thumbnail: cameraThumbnails[4],
		coordinates: [46.3755, 24.547] as [number, number],
	},
	{
		id: 6,
		project: "Six Flags",
		cameraName: "Service Road - CAM06",
		location: "North Access",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[5],
		coordinates: [46.377, 24.549] as [number, number],
	},
	// Aquarabia - 5 cameras (around 46.380, 24.550)
	{
		id: 7,
		project: "Aquarabia",
		cameraName: "Wave Pool Construction - CAM01",
		location: "Central Area",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[6],
		coordinates: [46.38, 24.55] as [number, number],
	},
	{
		id: 8,
		project: "Aquarabia",
		cameraName: "Slide Tower - CAM02",
		location: "North Wing",
		status: "offline",
		lastUpdate: "2 hours ago",
		thumbnail: cameraThumbnails[0],
		coordinates: [46.3805, 24.5515] as [number, number],
	},
	{
		id: 9,
		project: "Aquarabia",
		cameraName: "Lazy River - CAM03",
		location: "East Section",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[1],
		coordinates: [46.3815, 24.5505] as [number, number],
	},
	{
		id: 10,
		project: "Aquarabia",
		cameraName: "Kids Zone - CAM04",
		location: "Family Area",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[2],
		coordinates: [46.3795, 24.5495] as [number, number],
	},
	{
		id: 11,
		project: "Aquarabia",
		cameraName: "Main Building - CAM05",
		location: "Reception",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[3],
		coordinates: [46.379, 24.549] as [number, number],
	},
	// Gaming District - 5 cameras (around 46.372, 24.555)
	{
		id: 12,
		project: "Gaming District",
		cameraName: "Arena Foundation - CAM01",
		location: "Main Plaza",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[4],
		coordinates: [46.372, 24.555] as [number, number],
	},
	{
		id: 13,
		project: "Gaming District",
		cameraName: "Esports Center - CAM02",
		location: "Building A",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[5],
		coordinates: [46.3715, 24.556] as [number, number],
	},
	{
		id: 14,
		project: "Gaming District",
		cameraName: "VR Experience Hub - CAM03",
		location: "Building B",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[6],
		coordinates: [46.3725, 24.5555] as [number, number],
	},
	{
		id: 15,
		project: "Gaming District",
		cameraName: "Food Court - CAM04",
		location: "Central Hub",
		status: "offline",
		lastUpdate: "30 min ago",
		thumbnail: cameraThumbnails[0],
		coordinates: [46.3718, 24.5545] as [number, number],
	},
	{
		id: 16,
		project: "Gaming District",
		cameraName: "Underground Parking - CAM05",
		location: "Level B1",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[1],
		coordinates: [46.373, 24.554] as [number, number],
	},
	// Speed Park - 4 cameras (around 46.368, 24.542)
	{
		id: 17,
		project: "Speed Park",
		cameraName: "Track Construction - CAM01",
		location: "Circuit Section A",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[2],
		coordinates: [46.368, 24.542] as [number, number],
	},
	{
		id: 18,
		project: "Speed Park",
		cameraName: "Pit Lane - CAM02",
		location: "Service Area",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[3],
		coordinates: [46.369, 24.5415] as [number, number],
	},
	{
		id: 19,
		project: "Speed Park",
		cameraName: "The Blade Corner - CAM03",
		location: "Turn 7",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[4],
		coordinates: [46.3675, 24.543] as [number, number],
	},
	{
		id: 20,
		project: "Speed Park",
		cameraName: "Grandstand - CAM04",
		location: "Main Tribune",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[5],
		coordinates: [46.3685, 24.5425] as [number, number],
	},
	// Stadium - 5 cameras (around 46.365, 24.558)
	{
		id: 21,
		project: "Stadium",
		cameraName: "Seating Installation - CAM01",
		location: "South Stand",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[6],
		coordinates: [46.365, 24.5575] as [number, number],
	},
	{
		id: 22,
		project: "Stadium",
		cameraName: "Cliff Integration - CAM02",
		location: "North Cliff",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[0],
		coordinates: [46.3655, 24.559] as [number, number],
	},
	{
		id: 23,
		project: "Stadium",
		cameraName: "Roof Structure - CAM03",
		location: "Retractable Section",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[1],
		coordinates: [46.366, 24.558] as [number, number],
	},
	{
		id: 24,
		project: "Stadium",
		cameraName: "Pitch Area - CAM04",
		location: "Field Level",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[2],
		coordinates: [46.3652, 24.5582] as [number, number],
	},
	{
		id: 25,
		project: "Stadium",
		cameraName: "LED Wall Installation - CAM05",
		location: "West Stand",
		status: "offline",
		lastUpdate: "45 min ago",
		thumbnail: cameraThumbnails[3],
		coordinates: [46.3645, 24.5578] as [number, number],
	},
	// Golf Course - 4 cameras (around 46.358, 24.565)
	{
		id: 26,
		project: "Golf Course",
		cameraName: "Clubhouse - CAM01",
		location: "Main Building",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[4],
		coordinates: [46.358, 24.565] as [number, number],
	},
	{
		id: 27,
		project: "Golf Course",
		cameraName: "Nicklaus Course - CAM02",
		location: "Hole 18",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[5],
		coordinates: [46.359, 24.566] as [number, number],
	},
	{
		id: 28,
		project: "Golf Course",
		cameraName: "Cliff Edge Holes - CAM03",
		location: "Tuwaiq Cliff",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[6],
		coordinates: [46.3575, 24.567] as [number, number],
	},
	{
		id: 29,
		project: "Golf Course",
		cameraName: "Irrigation System - CAM04",
		location: "Maintenance",
		status: "offline",
		lastUpdate: "3 hours ago",
		thumbnail: cameraThumbnails[0],
		coordinates: [46.3585, 24.5655] as [number, number],
	},
	// Mercedes-AMG - 4 cameras (around 46.362, 24.548)
	{
		id: 30,
		project: "Mercedes-AMG",
		cameraName: "Showroom Construction - CAM01",
		location: "Main Hall",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[1],
		coordinates: [46.362, 24.548] as [number, number],
	},
	{
		id: 31,
		project: "Mercedes-AMG",
		cameraName: "Track Experience - CAM02",
		location: "Test Circuit",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[2],
		coordinates: [46.363, 24.5475] as [number, number],
	},
	{
		id: 32,
		project: "Mercedes-AMG",
		cameraName: "Service Center - CAM03",
		location: "Workshop",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[3],
		coordinates: [46.3615, 24.5485] as [number, number],
	},
	{
		id: 33,
		project: "Mercedes-AMG",
		cameraName: "VIP Lounge - CAM04",
		location: "Upper Floor",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[4],
		coordinates: [46.3625, 24.5482] as [number, number],
	},
	// Arts Centre - 4 cameras (around 46.355, 24.552)
	{
		id: 34,
		project: "Arts Centre",
		cameraName: "Auditorium - CAM01",
		location: "Main Hall",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[5],
		coordinates: [46.355, 24.552] as [number, number],
	},
	{
		id: 35,
		project: "Arts Centre",
		cameraName: "Concert Hall - CAM02",
		location: "Stage Area",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[6],
		coordinates: [46.3555, 24.5525] as [number, number],
	},
	{
		id: 36,
		project: "Arts Centre",
		cameraName: "Gallery Wing - CAM03",
		location: "Exhibition Space",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[0],
		coordinates: [46.356, 24.5515] as [number, number],
	},
	{
		id: 37,
		project: "Arts Centre",
		cameraName: "Exterior Plaza - CAM04",
		location: "Main Entrance",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[1],
		coordinates: [46.3545, 24.5518] as [number, number],
	},
	// Studios - 4 cameras (around 46.350, 24.545)
	{
		id: 38,
		project: "Studios",
		cameraName: "Sound Stage A - CAM01",
		location: "Production Floor",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[2],
		coordinates: [46.35, 24.545] as [number, number],
	},
	{
		id: 39,
		project: "Studios",
		cameraName: "Backlot - CAM02",
		location: "Outdoor Sets",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[3],
		coordinates: [46.351, 24.5455] as [number, number],
	},
	{
		id: 40,
		project: "Studios",
		cameraName: "Post Production - CAM03",
		location: "Building C",
		status: "online",
		lastUpdate: "Live",
		thumbnail: cameraThumbnails[4],
		coordinates: [46.3505, 24.5445] as [number, number],
	},
	{
		id: 41,
		project: "Studios",
		cameraName: "Equipment Storage - CAM04",
		location: "Warehouse",
		status: "offline",
		lastUpdate: "15 min ago",
		thumbnail: cameraThumbnails[5],
		coordinates: [46.3515, 24.544] as [number, number],
	},
];

// Drone capture thumbnail images
const droneThumbnails = [
	"/images/drone-01.webp",
	"/images/drone-02.avif",
	"/images/drone-03.jpg",
	"/images/drone-04.jpg",
	"/images/drone-05.jpg",
	"/images/drone-06.jpg",
	"/images/drone-07.jpg",
];

// Mock data for drone captures
const droneCaptureData = [
	// Six Flags - 4 captures
	{
		id: 1,
		project: "Six Flags",
		captureDate: "2025-01-15",
		captureTime: "09:30 AM",
		type: "Orthomosaic",
		coverage: "100%",
		resolution: "2cm/px",
		thumbnail: droneThumbnails[0],
		status: "processed",
		coordinates: [46.3768, 24.5465] as [number, number],
	},
	{
		id: 2,
		project: "Six Flags",
		captureDate: "2025-01-08",
		captureTime: "10:00 AM",
		type: "3D Model",
		coverage: "98%",
		resolution: "3cm/px",
		thumbnail: droneThumbnails[1],
		status: "processed",
		coordinates: [46.3772, 24.5475] as [number, number],
	},
	{
		id: 3,
		project: "Six Flags",
		captureDate: "2025-01-01",
		captureTime: "08:45 AM",
		type: "Progress Video",
		coverage: "100%",
		resolution: "4K",
		thumbnail: droneThumbnails[2],
		status: "processed",
		coordinates: [46.3775, 24.5468] as [number, number],
	},
	{
		id: 4,
		project: "Six Flags",
		captureDate: "2024-12-25",
		captureTime: "09:15 AM",
		type: "Thermal Scan",
		coverage: "92%",
		resolution: "5cm/px",
		thumbnail: droneThumbnails[3],
		status: "processed",
		coordinates: [46.3765, 24.5472] as [number, number],
	},
	// Aquarabia - 3 captures
	{
		id: 5,
		project: "Aquarabia",
		captureDate: "2025-01-14",
		captureTime: "10:15 AM",
		type: "3D Model",
		coverage: "95%",
		resolution: "3cm/px",
		thumbnail: droneThumbnails[4],
		status: "processed",
		coordinates: [46.3802, 24.5502] as [number, number],
	},
	{
		id: 6,
		project: "Aquarabia",
		captureDate: "2025-01-07",
		captureTime: "11:00 AM",
		type: "Orthomosaic",
		coverage: "100%",
		resolution: "2cm/px",
		thumbnail: droneThumbnails[5],
		status: "processed",
		coordinates: [46.3798, 24.5508] as [number, number],
	},
	{
		id: 7,
		project: "Aquarabia",
		captureDate: "2024-12-30",
		captureTime: "09:30 AM",
		type: "Progress Video",
		coverage: "100%",
		resolution: "4K",
		thumbnail: droneThumbnails[6],
		status: "processed",
		coordinates: [46.3805, 24.5498] as [number, number],
	},
	// Gaming District - 3 captures
	{
		id: 8,
		project: "Gaming District",
		captureDate: "2025-01-15",
		captureTime: "08:45 AM",
		type: "Orthomosaic",
		coverage: "100%",
		resolution: "2cm/px",
		thumbnail: droneThumbnails[0],
		status: "processing",
		coordinates: [46.3718, 24.5548] as [number, number],
	},
	{
		id: 9,
		project: "Gaming District",
		captureDate: "2025-01-10",
		captureTime: "10:30 AM",
		type: "3D Model",
		coverage: "97%",
		resolution: "3cm/px",
		thumbnail: droneThumbnails[1],
		status: "processed",
		coordinates: [46.3722, 24.5555] as [number, number],
	},
	{
		id: 10,
		project: "Gaming District",
		captureDate: "2025-01-03",
		captureTime: "09:00 AM",
		type: "Thermal Scan",
		coverage: "88%",
		resolution: "5cm/px",
		thumbnail: droneThumbnails[2],
		status: "processed",
		coordinates: [46.3725, 24.5545] as [number, number],
	},
	// Speed Park - 3 captures
	{
		id: 11,
		project: "Speed Park",
		captureDate: "2025-01-13",
		captureTime: "11:00 AM",
		type: "Progress Video",
		coverage: "100%",
		resolution: "4K",
		thumbnail: droneThumbnails[3],
		status: "processed",
		coordinates: [46.368, 24.542] as [number, number],
	},
	{
		id: 12,
		project: "Speed Park",
		captureDate: "2025-01-06",
		captureTime: "08:30 AM",
		type: "Orthomosaic",
		coverage: "100%",
		resolution: "2cm/px",
		thumbnail: droneThumbnails[4],
		status: "processed",
		coordinates: [46.3685, 24.5425] as [number, number],
	},
	{
		id: 13,
		project: "Speed Park",
		captureDate: "2024-12-28",
		captureTime: "10:15 AM",
		type: "3D Model",
		coverage: "96%",
		resolution: "3cm/px",
		thumbnail: droneThumbnails[5],
		status: "processed",
		coordinates: [46.3678, 24.5418] as [number, number],
	},
	// Stadium - 4 captures
	{
		id: 14,
		project: "Stadium",
		captureDate: "2025-01-15",
		captureTime: "07:30 AM",
		type: "Thermal Scan",
		coverage: "85%",
		resolution: "5cm/px",
		thumbnail: droneThumbnails[6],
		status: "processed",
		coordinates: [46.365, 24.5578] as [number, number],
	},
	{
		id: 15,
		project: "Stadium",
		captureDate: "2025-01-12",
		captureTime: "09:45 AM",
		type: "Orthomosaic",
		coverage: "100%",
		resolution: "2cm/px",
		thumbnail: droneThumbnails[0],
		status: "processed",
		coordinates: [46.3655, 24.5582] as [number, number],
	},
	{
		id: 16,
		project: "Stadium",
		captureDate: "2025-01-05",
		captureTime: "11:30 AM",
		type: "3D Model",
		coverage: "94%",
		resolution: "3cm/px",
		thumbnail: droneThumbnails[1],
		status: "processing",
		coordinates: [46.3648, 24.5585] as [number, number],
	},
	{
		id: 17,
		project: "Stadium",
		captureDate: "2024-12-22",
		captureTime: "08:00 AM",
		type: "Progress Video",
		coverage: "100%",
		resolution: "4K",
		thumbnail: droneThumbnails[2],
		status: "processed",
		coordinates: [46.3658, 24.5575] as [number, number],
	},
	// Golf Course - 3 captures
	{
		id: 18,
		project: "Golf Course",
		captureDate: "2025-01-12",
		captureTime: "06:00 AM",
		type: "Orthomosaic",
		coverage: "100%",
		resolution: "2cm/px",
		thumbnail: droneThumbnails[3],
		status: "processed",
		coordinates: [46.358, 24.5655] as [number, number],
	},
	{
		id: 19,
		project: "Golf Course",
		captureDate: "2025-01-04",
		captureTime: "06:30 AM",
		type: "3D Model",
		coverage: "98%",
		resolution: "3cm/px",
		thumbnail: droneThumbnails[4],
		status: "processed",
		coordinates: [46.3585, 24.566] as [number, number],
	},
	{
		id: 20,
		project: "Golf Course",
		captureDate: "2024-12-27",
		captureTime: "07:00 AM",
		type: "Thermal Scan",
		coverage: "90%",
		resolution: "5cm/px",
		thumbnail: droneThumbnails[5],
		status: "processed",
		coordinates: [46.3578, 24.5662] as [number, number],
	},
	// Mercedes-AMG - 3 captures
	{
		id: 21,
		project: "Mercedes-AMG",
		captureDate: "2025-01-14",
		captureTime: "10:00 AM",
		type: "Orthomosaic",
		coverage: "100%",
		resolution: "2cm/px",
		thumbnail: droneThumbnails[6],
		status: "processed",
		coordinates: [46.362, 24.5478] as [number, number],
	},
	{
		id: 22,
		project: "Mercedes-AMG",
		captureDate: "2025-01-09",
		captureTime: "09:30 AM",
		type: "Progress Video",
		coverage: "100%",
		resolution: "4K",
		thumbnail: droneThumbnails[0],
		status: "processed",
		coordinates: [46.3625, 24.5482] as [number, number],
	},
	{
		id: 23,
		project: "Mercedes-AMG",
		captureDate: "2025-01-02",
		captureTime: "11:15 AM",
		type: "3D Model",
		coverage: "93%",
		resolution: "3cm/px",
		thumbnail: droneThumbnails[1],
		status: "processed",
		coordinates: [46.3618, 24.5485] as [number, number],
	},
	// Arts Centre - 3 captures
	{
		id: 24,
		project: "Arts Centre",
		captureDate: "2025-01-13",
		captureTime: "08:00 AM",
		type: "3D Model",
		coverage: "96%",
		resolution: "3cm/px",
		thumbnail: droneThumbnails[2],
		status: "processed",
		coordinates: [46.355, 24.5518] as [number, number],
	},
	{
		id: 25,
		project: "Arts Centre",
		captureDate: "2025-01-06",
		captureTime: "09:45 AM",
		type: "Orthomosaic",
		coverage: "100%",
		resolution: "2cm/px",
		thumbnail: droneThumbnails[3],
		status: "processing",
		coordinates: [46.3555, 24.5522] as [number, number],
	},
	{
		id: 26,
		project: "Arts Centre",
		captureDate: "2024-12-29",
		captureTime: "10:30 AM",
		type: "Progress Video",
		coverage: "100%",
		resolution: "4K",
		thumbnail: droneThumbnails[4],
		status: "processed",
		coordinates: [46.3548, 24.5525] as [number, number],
	},
	// Studios - 3 captures
	{
		id: 27,
		project: "Studios",
		captureDate: "2025-01-11",
		captureTime: "07:45 AM",
		type: "Orthomosaic",
		coverage: "100%",
		resolution: "2cm/px",
		thumbnail: droneThumbnails[5],
		status: "processed",
		coordinates: [46.3502, 24.5448] as [number, number],
	},
	{
		id: 28,
		project: "Studios",
		captureDate: "2025-01-05",
		captureTime: "08:30 AM",
		type: "Thermal Scan",
		coverage: "87%",
		resolution: "5cm/px",
		thumbnail: droneThumbnails[6],
		status: "processed",
		coordinates: [46.3508, 24.5452] as [number, number],
	},
	{
		id: 29,
		project: "Studios",
		captureDate: "2024-12-26",
		captureTime: "09:00 AM",
		type: "3D Model",
		coverage: "95%",
		resolution: "3cm/px",
		thumbnail: droneThumbnails[0],
		status: "processed",
		coordinates: [46.3498, 24.5445] as [number, number],
	},
];

// Time-lapse thumbnail images
const timelapseThumbnails = [
	"/images/timelapse-01.png",
	"/images/timelapse-02.png",
	"/images/timelapse-03.png",
	"/images/timelapse-04.png",
	"/images/timelapse-05.png",
	"/images/timelapse-06.png",
	"/images/timelapse-07.png",
	"/images/timelapse-08.png",
];

// Mock data for time-lapse sequences
const timelapseData = [
	// Six Flags - 3 timelapses
	{
		id: 1,
		project: "Six Flags",
		title: "Main Structure Progress",
		startDate: "2024-06-01",
		endDate: "2025-01-15",
		frames: 228,
		duration: "1:52",
		thumbnail: timelapseThumbnails[0],
		coordinates: [46.3768, 24.5468] as [number, number],
	},
	{
		id: 2,
		project: "Six Flags",
		title: "Falcon's Flight Tower",
		startDate: "2024-08-15",
		endDate: "2025-01-10",
		frames: 148,
		duration: "1:14",
		thumbnail: timelapseThumbnails[1],
		coordinates: [46.378, 24.548] as [number, number],
	},
	{
		id: 3,
		project: "Six Flags",
		title: "Steel Assembly Zone",
		startDate: "2024-09-01",
		endDate: "2025-01-12",
		frames: 134,
		duration: "1:07",
		thumbnail: timelapseThumbnails[2],
		coordinates: [46.3785, 24.5465] as [number, number],
	},
	// Aquarabia - 3 timelapses
	{
		id: 4,
		project: "Aquarabia",
		title: "Wave Pool Construction",
		startDate: "2024-08-15",
		endDate: "2025-01-14",
		frames: 153,
		duration: "1:16",
		thumbnail: timelapseThumbnails[3],
		coordinates: [46.38, 24.55] as [number, number],
	},
	{
		id: 5,
		project: "Aquarabia",
		title: "Slide Tower Assembly",
		startDate: "2024-09-20",
		endDate: "2025-01-08",
		frames: 111,
		duration: "0:55",
		thumbnail: timelapseThumbnails[4],
		coordinates: [46.3805, 24.5515] as [number, number],
	},
	{
		id: 6,
		project: "Aquarabia",
		title: "Lazy River Formation",
		startDate: "2024-10-01",
		endDate: "2025-01-05",
		frames: 97,
		duration: "0:48",
		thumbnail: timelapseThumbnails[5],
		coordinates: [46.3815, 24.5505] as [number, number],
	},
	// Gaming District - 2 timelapses
	{
		id: 7,
		project: "Gaming District",
		title: "Foundation to Frame",
		startDate: "2024-09-01",
		endDate: "2025-01-15",
		frames: 137,
		duration: "1:08",
		thumbnail: timelapseThumbnails[6],
		coordinates: [46.372, 24.555] as [number, number],
	},
	{
		id: 8,
		project: "Gaming District",
		title: "Arena Construction",
		startDate: "2024-10-15",
		endDate: "2025-01-12",
		frames: 90,
		duration: "0:45",
		thumbnail: timelapseThumbnails[7],
		coordinates: [46.3715, 24.556] as [number, number],
	},
	// Speed Park - 3 timelapses
	{
		id: 9,
		project: "Speed Park",
		title: "Track Layout Progress",
		startDate: "2024-07-01",
		endDate: "2025-01-13",
		frames: 196,
		duration: "1:38",
		thumbnail: timelapseThumbnails[0],
		coordinates: [46.368, 24.542] as [number, number],
	},
	{
		id: 10,
		project: "Speed Park",
		title: "Pit Lane Construction",
		startDate: "2024-08-20",
		endDate: "2025-01-10",
		frames: 144,
		duration: "1:12",
		thumbnail: timelapseThumbnails[1],
		coordinates: [46.369, 24.5415] as [number, number],
	},
	{
		id: 11,
		project: "Speed Park",
		title: "Grandstand Assembly",
		startDate: "2024-09-15",
		endDate: "2025-01-08",
		frames: 116,
		duration: "0:58",
		thumbnail: timelapseThumbnails[2],
		coordinates: [46.3685, 24.5425] as [number, number],
	},
	// Stadium - 3 timelapses
	{
		id: 12,
		project: "Stadium",
		title: "Cliff Integration",
		startDate: "2024-05-15",
		endDate: "2025-01-15",
		frames: 245,
		duration: "2:02",
		thumbnail: timelapseThumbnails[3],
		coordinates: [46.3655, 24.559] as [number, number],
	},
	{
		id: 13,
		project: "Stadium",
		title: "Roof Structure Progress",
		startDate: "2024-08-01",
		endDate: "2025-01-12",
		frames: 164,
		duration: "1:22",
		thumbnail: timelapseThumbnails[4],
		coordinates: [46.366, 24.558] as [number, number],
	},
	{
		id: 14,
		project: "Stadium",
		title: "Seating Installation",
		startDate: "2024-10-01",
		endDate: "2025-01-10",
		frames: 102,
		duration: "0:51",
		thumbnail: timelapseThumbnails[5],
		coordinates: [46.365, 24.5575] as [number, number],
	},
	// Golf Course - 2 timelapses
	{
		id: 15,
		project: "Golf Course",
		title: "Clubhouse Construction",
		startDate: "2024-07-15",
		endDate: "2025-01-14",
		frames: 183,
		duration: "1:31",
		thumbnail: timelapseThumbnails[6],
		coordinates: [46.358, 24.565] as [number, number],
	},
	{
		id: 16,
		project: "Golf Course",
		title: "Cliff Edge Holes",
		startDate: "2024-09-01",
		endDate: "2025-01-11",
		frames: 133,
		duration: "1:06",
		thumbnail: timelapseThumbnails[7],
		coordinates: [46.3575, 24.567] as [number, number],
	},
	// Mercedes-AMG - 2 timelapses
	{
		id: 17,
		project: "Mercedes-AMG",
		title: "Showroom Construction",
		startDate: "2024-08-01",
		endDate: "2025-01-13",
		frames: 166,
		duration: "1:23",
		thumbnail: timelapseThumbnails[0],
		coordinates: [46.362, 24.548] as [number, number],
	},
	{
		id: 18,
		project: "Mercedes-AMG",
		title: "Test Circuit Layout",
		startDate: "2024-09-15",
		endDate: "2025-01-09",
		frames: 117,
		duration: "0:58",
		thumbnail: timelapseThumbnails[1],
		coordinates: [46.363, 24.5475] as [number, number],
	},
	// Arts Centre - 2 timelapses
	{
		id: 19,
		project: "Arts Centre",
		title: "Auditorium Build",
		startDate: "2024-06-15",
		endDate: "2025-01-14",
		frames: 213,
		duration: "1:46",
		thumbnail: timelapseThumbnails[2],
		coordinates: [46.355, 24.552] as [number, number],
	},
	{
		id: 20,
		project: "Arts Centre",
		title: "Concert Hall Progress",
		startDate: "2024-08-20",
		endDate: "2025-01-11",
		frames: 144,
		duration: "1:12",
		thumbnail: timelapseThumbnails[3],
		coordinates: [46.3555, 24.5525] as [number, number],
	},
	// Studios - 2 timelapses
	{
		id: 21,
		project: "Studios",
		title: "Sound Stage A",
		startDate: "2024-07-01",
		endDate: "2025-01-12",
		frames: 195,
		duration: "1:37",
		thumbnail: timelapseThumbnails[4],
		coordinates: [46.35, 24.545] as [number, number],
	},
	{
		id: 22,
		project: "Studios",
		title: "Backlot Development",
		startDate: "2024-09-01",
		endDate: "2025-01-10",
		frames: 132,
		duration: "1:06",
		thumbnail: timelapseThumbnails[5],
		coordinates: [46.351, 24.5455] as [number, number],
	},
];

// Camera List Item
function CameraListItem({
	camera,
	isSelected,
	onClick,
}: {
	camera: (typeof liveCameraData)[0];
	isSelected: boolean;
	onClick: () => void;
}) {
	const online = camera.status === "online";
	return (
		<AssetListItem
			thumbnail={online ? camera.thumbnail : undefined}
			thumbnailAlt={camera.cameraName}
			fallback={<Camera className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground/50" />}
			overlay={
				online ? (
					<div className="wwc:absolute wwc:top-1 wwc:left-1 wwc:flex wwc:items-center wwc:gap-1 wwc:rounded wwc:bg-red-600 wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:font-medium wwc:text-white">
						<span className="wwc:h-1 wwc:w-1 wwc:animate-pulse wwc:rounded-full wwc:bg-white" />
						LIVE
					</div>
				) : null
			}
			title={camera.cameraName}
			subtitle={camera.location}
			selected={isSelected}
			onClick={onClick}
		>
			<Badge variant={online ? "default" : "secondary"} className={cn("wwc:text-xs", online && "wwc:bg-green-600")}>
				{camera.status}
			</Badge>
			<span>{camera.lastUpdate}</span>
		</AssetListItem>
	);
}

// Camera Map View with Mapbox
function CameraMapView({onCameraSelect}: {onCameraSelect?: (camera: (typeof liveCameraData)[0]) => void}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProject, setSelectedProject] = useState<string | null>(null);
	const [selectedCamera, setSelectedCamera] = useState<(typeof liveCameraData)[0] | null>(null);
	const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/satellite-streets-v12");
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const markersRef = useRef<mapboxgl.Marker[]>([]);

	// Get unique projects
	const projects = [...new Set(liveCameraData.map((c) => c.project))];

	// Filter cameras
	const filteredCameras = liveCameraData.filter((camera) => {
		const matchesSearch =
			camera.cameraName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			camera.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
			camera.project.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesProject = !selectedProject || camera.project === selectedProject;
		return matchesSearch && matchesProject;
	});

	// Qiddiya coordinates
	const mapCenter: [number, number] = [46.365, 24.552];

	// Handle camera selection
	const handleCameraSelect = (camera: (typeof liveCameraData)[0]) => {
		setSelectedCamera(camera);
		onCameraSelect?.(camera);

		// Fly to camera location
		if (camera.coordinates && mapRef.current) {
			mapRef.current.flyTo({
				center: camera.coordinates,
				zoom: 17,
				duration: 1500,
			});
		}
	};

	// Add markers
	const addMarkers = () => {
		if (!mapRef.current) return;

		// Clear existing markers
		markersRef.current.forEach((marker) => marker.remove());
		markersRef.current = [];

		// Collect bounds
		const bounds = new mapboxgl.LngLatBounds();

		filteredCameras.forEach((camera) => {
			if (!camera.coordinates || !mapRef.current) return;

			bounds.extend(camera.coordinates);

			// Create marker element
			const el = document.createElement("div");
			el.className = "camera-marker";
			const isSelected = selectedCamera?.id === camera.id;
			const color = camera.status === "online" ? "#22c55e" : "#ef4444";

			el.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: ${color};
          border: 2px solid ${camera.status === "online" ? "#16a34a" : "#dc2626"};
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
          transition: transform 0.2s;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
          ${
						camera.status === "online"
							? `
            <div style="
              position: absolute;
              top: -2px;
              right: -2px;
              width: 10px;
              height: 10px;
              background: white;
              border: 2px solid #16a34a;
              border-radius: 50%;
              animation: pulse 2s infinite;
            "></div>
          `
							: ""
					}
        </div>
      `;

			el.addEventListener("click", () => handleCameraSelect(camera));
			el.addEventListener("mouseenter", () => {
				el.querySelector("div")?.setAttribute(
					"style",
					el.querySelector("div")?.getAttribute("style")?.replace("scale(1)", "scale(1.15)") || "",
				);
			});
			el.addEventListener("mouseleave", () => {
				if (selectedCamera?.id !== camera.id) {
					el.querySelector("div")?.setAttribute(
						"style",
						el.querySelector("div")?.getAttribute("style")?.replace("scale(1.15)", "scale(1)") || "",
					);
				}
			});

			const marker = new mapboxgl.Marker({element: el, anchor: "center"})
				.setLngLat(camera.coordinates)
				.addTo(mapRef.current!);

			markersRef.current.push(marker);
		});

		// Fit bounds if we have cameras
		if (!bounds.isEmpty() && mapRef.current && !selectedCamera) {
			mapRef.current.fitBounds(bounds, {
				padding: {top: 50, bottom: 50, left: 50, right: 50},
				maxZoom: 15,
			});
		}
	};

	// Initialize map
	useEffect(() => {
		if (!mapContainerRef.current || mapRef.current) return;

		mapboxgl.accessToken = MAPBOX_TOKEN;

		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: mapStyle,
			center: mapCenter,
			zoom: 13,
		});

		mapRef.current.on("load", () => {
			addMarkers();
		});

		// Add CSS for pulse animation
		const style = document.createElement("style");
		style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
		document.head.appendChild(style);

		return () => {
			markersRef.current.forEach((marker) => marker.remove());
			markersRef.current = [];
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	// Update markers when filters change
	useEffect(() => {
		if (mapRef.current?.loaded()) {
			addMarkers();
		}
	}, [filteredCameras, selectedCamera]);

	// Update map style
	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setStyle(mapStyle);
			mapRef.current.once("style.load", () => {
				addMarkers();
			});
		}
	}, [mapStyle]);

	const onlineCount = filteredCameras.filter((c) => c.status === "online").length;
	const offlineCount = filteredCameras.filter((c) => c.status === "offline").length;

	return (
		<div className="wwc:flex wwc:h-full wwc:overflow-hidden wwc:bg-background">
			{/* Left Panel - Camera List */}
			<div className="wwc:w-[340px] wwc:border-r wwc:flex wwc:flex-col wwc:shrink-0">
				{/* Header */}
				<div className="wwc:p-4 wwc:border-b wwc:space-y-3">
					<div className="wwc:flex wwc:items-center wwc:justify-between">
						<h3 className="wwc:font-semibold wwc:flex wwc:items-center wwc:gap-2">
							<Camera className="wwc:h-4 wwc:w-4" />
							Cameras
							<Badge variant="secondary">{filteredCameras.length}</Badge>
						</h3>
						<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-xs">
							<span className="wwc:flex wwc:items-center wwc:gap-1">
								<span className="wwc:w-2 wwc:h-2 wwc:rounded-full wwc:bg-green-500" />
								{onlineCount}
							</span>
							<span className="wwc:flex wwc:items-center wwc:gap-1">
								<span className="wwc:w-2 wwc:h-2 wwc:rounded-full wwc:bg-red-500" />
								{offlineCount}
							</span>
						</div>
					</div>
					{/* Search */}
					<div className="wwc:relative">
						<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-4 wwc:w-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
						<Input
							placeholder="Search cameras..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="wwc:h-9 wwc:pl-9"
						/>
					</div>
					{/* Project Filter */}
					<div className="wwc:flex wwc:flex-wrap wwc:gap-1">
						<Button
							variant={!selectedProject ? "default" : "outline"}
							size="sm"
							className="wwc:h-7 wwc:text-xs"
							onClick={() => setSelectedProject(null)}
						>
							All
						</Button>
						{projects.slice(0, 4).map((project) => (
							<Button
								key={project}
								variant={selectedProject === project ? "default" : "outline"}
								size="sm"
								className="wwc:h-7 wwc:text-xs"
								onClick={() => setSelectedProject(selectedProject === project ? null : project)}
							>
								{project.split(" ")[0]}
							</Button>
						))}
					</div>
				</div>
				{/* Camera List */}
				<ScrollArea className="wwc:flex-1">
					<div className="wwc:p-4 wwc:space-y-3">
						{filteredCameras.map((camera) => (
							<CameraListItem
								key={camera.id}
								camera={camera}
								isSelected={selectedCamera?.id === camera.id}
								onClick={() => handleCameraSelect(camera)}
							/>
						))}
					</div>
				</ScrollArea>
			</div>

			{/* Right Panel - Map */}
			<div className="wwc:flex-1 wwc:relative">
				<div ref={mapContainerRef} className="wwc:h-full wwc:w-full" />
				{/* Map Controls */}
				<MapControls mapRef={mapRef} mapStyle={mapStyle} onMapStyleChange={setMapStyle} />
				{/* Selected Camera Info */}
				{selectedCamera && (
					<div className="wwc:absolute wwc:bottom-4 wwc:left-4 wwc:right-4 wwc:max-w-md wwc:bg-background wwc:border wwc:rounded-lg wwc:shadow-xl wwc:p-4">
						<div className="wwc:flex wwc:items-start wwc:gap-4">
							<div className="wwc:w-24 wwc:h-16 wwc:rounded-lg wwc:bg-muted wwc:overflow-hidden wwc:shrink-0">
								{selectedCamera.status === "online" ? (
									<img src={selectedCamera.thumbnail} alt="" className="wwc:w-full wwc:h-full wwc:object-cover" />
								) : (
									<div className="wwc:w-full wwc:h-full wwc:flex wwc:items-center wwc:justify-center">
										<Camera className="wwc:h-6 wwc:w-6 wwc:text-muted-foreground/50" />
									</div>
								)}
							</div>
							<div className="wwc:flex-1 wwc:min-w-0">
								<div className="wwc:flex wwc:items-start wwc:justify-between">
									<div>
										<h4 className="wwc:font-medium">{selectedCamera.cameraName}</h4>
										<p className="wwc:text-sm wwc:text-muted-foreground">
											{selectedCamera.project} • {selectedCamera.location}
										</p>
									</div>
									<Button
										variant="ghost"
										icon
										className="wwc:h-6 wwc:w-6 wwc:shrink-0"
										onClick={() => setSelectedCamera(null)}
									>
										<X className="wwc:h-4 wwc:w-4" />
									</Button>
								</div>
								<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:mt-2">
									<Badge
										variant={selectedCamera.status === "online" ? "default" : "secondary"}
										className={`wwc:text-xs ${selectedCamera.status === "online" ? "wwc:bg-green-600" : ""}`}
									>
										{selectedCamera.status === "online" ? "Live" : "Offline"}
									</Badge>
									<span className="wwc:text-xs wwc:text-muted-foreground">{selectedCamera.lastUpdate}</span>
								</div>
							</div>
						</div>
					</div>
				)}
				{/* Legend */}
				<div className="wwc:absolute wwc:top-4 wwc:right-4 wwc:bg-background/90 wwc:backdrop-blur-sm wwc:border wwc:rounded-lg wwc:px-3 wwc:py-2 wwc:text-xs">
					<div className="wwc:flex wwc:items-center wwc:gap-3">
						<span className="wwc:flex wwc:items-center wwc:gap-1.5">
							<span className="wwc:w-3 wwc:h-3 wwc:rounded-full wwc:bg-green-500 wwc:border wwc:border-green-600" />
							Online
						</span>
						<span className="wwc:flex wwc:items-center wwc:gap-1.5">
							<span className="wwc:w-3 wwc:h-3 wwc:rounded-full wwc:bg-red-500 wwc:border wwc:border-red-600" />
							Offline
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

// Drone List Item
function DroneListItem({
	capture,
	isSelected,
	onClick,
}: {
	capture: (typeof droneCaptureData)[0];
	isSelected: boolean;
	onClick: () => void;
}) {
	const processed = capture.status === "processed";
	return (
		<AssetListItem
			thumbnail={capture.thumbnail}
			thumbnailAlt={`${capture.project} - ${capture.type}`}
			overlay={
				capture.status === "processing" ? (
					<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center wwc:bg-black/40">
						<RefreshCw className="wwc:h-4 wwc:w-4 wwc:animate-spin wwc:text-white" />
					</div>
				) : null
			}
			title={capture.type}
			subtitle={capture.project}
			selected={isSelected}
			onClick={onClick}
		>
			<Badge
				variant={processed ? "default" : "secondary"}
				className={cn("wwc:text-xs", processed ? "wwc:bg-green-600" : "wwc:bg-amber-600")}
			>
				{processed ? "Ready" : "Processing"}
			</Badge>
			<span>{capture.captureDate}</span>
		</AssetListItem>
	);
}

// Drone Map View with Mapbox
function DroneMapView({onCaptureSelect}: {onCaptureSelect?: (capture: (typeof droneCaptureData)[0]) => void}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProject, setSelectedProject] = useState<string | null>(null);
	const [selectedCapture, setSelectedCapture] = useState<(typeof droneCaptureData)[0] | null>(null);
	const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/satellite-streets-v12");
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const markersRef = useRef<mapboxgl.Marker[]>([]);

	// Get unique projects
	const projects = [...new Set(droneCaptureData.map((c) => c.project))];

	// Filter captures
	const filteredCaptures = droneCaptureData.filter((capture) => {
		const matchesSearch =
			capture.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
			capture.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
			capture.captureDate.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesProject = !selectedProject || capture.project === selectedProject;
		return matchesSearch && matchesProject;
	});

	// Qiddiya coordinates
	const mapCenter: [number, number] = [46.365, 24.552];

	// Handle capture selection
	const handleCaptureSelect = (capture: (typeof droneCaptureData)[0]) => {
		setSelectedCapture(capture);
		onCaptureSelect?.(capture);

		// Fly to capture location
		if (capture.coordinates && mapRef.current) {
			mapRef.current.flyTo({
				center: capture.coordinates,
				zoom: 17,
				duration: 1500,
			});
		}
	};

	// Add markers
	const addMarkers = () => {
		if (!mapRef.current) return;

		// Clear existing markers
		markersRef.current.forEach((marker) => marker.remove());
		markersRef.current = [];

		// Collect bounds
		const bounds = new mapboxgl.LngLatBounds();

		filteredCaptures.forEach((capture) => {
			if (!capture.coordinates || !mapRef.current) return;

			bounds.extend(capture.coordinates);

			// Create marker element
			const el = document.createElement("div");
			el.className = "drone-marker";
			const isSelected = selectedCapture?.id === capture.id;
			const color = capture.status === "processed" ? "#3b82f6" : "#f59e0b";

			el.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: ${color};
          border: 2px solid ${capture.status === "processed" ? "#2563eb" : "#d97706"};
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
          transition: transform 0.2s;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
          </svg>
        </div>
      `;

			el.addEventListener("click", () => handleCaptureSelect(capture));
			el.addEventListener("mouseenter", () => {
				el.querySelector("div")?.setAttribute(
					"style",
					el.querySelector("div")?.getAttribute("style")?.replace("scale(1)", "scale(1.15)") || "",
				);
			});
			el.addEventListener("mouseleave", () => {
				if (selectedCapture?.id !== capture.id) {
					el.querySelector("div")?.setAttribute(
						"style",
						el.querySelector("div")?.getAttribute("style")?.replace("scale(1.15)", "scale(1)") || "",
					);
				}
			});

			const marker = new mapboxgl.Marker({element: el, anchor: "center"})
				.setLngLat(capture.coordinates)
				.addTo(mapRef.current!);

			markersRef.current.push(marker);
		});

		// Fit bounds if we have captures
		if (!bounds.isEmpty() && mapRef.current && !selectedCapture) {
			mapRef.current.fitBounds(bounds, {
				padding: {top: 50, bottom: 50, left: 50, right: 50},
				maxZoom: 15,
			});
		}
	};

	// Initialize map
	useEffect(() => {
		if (!mapContainerRef.current || mapRef.current) return;

		mapboxgl.accessToken = MAPBOX_TOKEN;

		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: mapStyle,
			center: mapCenter,
			zoom: 13,
		});

		mapRef.current.on("load", () => {
			addMarkers();
		});

		return () => {
			markersRef.current.forEach((marker) => marker.remove());
			markersRef.current = [];
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	// Update markers when filters change
	useEffect(() => {
		if (mapRef.current?.loaded()) {
			addMarkers();
		}
	}, [filteredCaptures, selectedCapture]);

	// Update map style
	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setStyle(mapStyle);
			mapRef.current.once("style.load", () => {
				addMarkers();
			});
		}
	}, [mapStyle]);

	const processedCount = filteredCaptures.filter((c) => c.status === "processed").length;
	const processingCount = filteredCaptures.filter((c) => c.status === "processing").length;

	return (
		<div className="wwc:flex wwc:h-full wwc:overflow-hidden wwc:bg-background">
			{/* Left Panel - Capture List */}
			<div className="wwc:w-[340px] wwc:border-r wwc:flex wwc:flex-col wwc:shrink-0">
				{/* Header */}
				<div className="wwc:p-4 wwc:border-b wwc:space-y-3">
					<div className="wwc:flex wwc:items-center wwc:justify-between">
						<h3 className="wwc:font-semibold wwc:flex wwc:items-center wwc:gap-2">
							<Plane className="wwc:h-4 wwc:w-4" />
							Drone Captures
							<Badge variant="secondary">{filteredCaptures.length}</Badge>
						</h3>
						<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-xs">
							<span className="wwc:flex wwc:items-center wwc:gap-1">
								<span className="wwc:w-2 wwc:h-2 wwc:rounded-full wwc:bg-blue-500" />
								{processedCount}
							</span>
							<span className="wwc:flex wwc:items-center wwc:gap-1">
								<span className="wwc:w-2 wwc:h-2 wwc:rounded-full wwc:bg-amber-500" />
								{processingCount}
							</span>
						</div>
					</div>
					{/* Search */}
					<div className="wwc:relative">
						<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-4 wwc:w-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
						<Input
							placeholder="Search captures..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="wwc:h-9 wwc:pl-9"
						/>
					</div>
					{/* Project Filter */}
					<div className="wwc:flex wwc:flex-wrap wwc:gap-1">
						<Button
							variant={!selectedProject ? "default" : "outline"}
							size="sm"
							className="wwc:h-7 wwc:text-xs"
							onClick={() => setSelectedProject(null)}
						>
							All
						</Button>
						{projects.slice(0, 4).map((project) => (
							<Button
								key={project}
								variant={selectedProject === project ? "default" : "outline"}
								size="sm"
								className="wwc:h-7 wwc:text-xs"
								onClick={() => setSelectedProject(selectedProject === project ? null : project)}
							>
								{project.split(" ")[0]}
							</Button>
						))}
					</div>
				</div>
				{/* Capture List */}
				<ScrollArea className="wwc:flex-1">
					<div className="wwc:p-4 wwc:space-y-3">
						{filteredCaptures.map((capture) => (
							<DroneListItem
								key={capture.id}
								capture={capture}
								isSelected={selectedCapture?.id === capture.id}
								onClick={() => handleCaptureSelect(capture)}
							/>
						))}
					</div>
				</ScrollArea>
			</div>

			{/* Right Panel - Map */}
			<div className="wwc:flex-1 wwc:relative">
				<div ref={mapContainerRef} className="wwc:h-full wwc:w-full" />
				{/* Map Controls */}
				<MapControls mapRef={mapRef} mapStyle={mapStyle} onMapStyleChange={setMapStyle} />
				{/* Selected Capture Info */}
				{selectedCapture && (
					<div className="wwc:absolute wwc:bottom-4 wwc:left-4 wwc:right-4 wwc:max-w-md wwc:bg-background wwc:border wwc:rounded-lg wwc:shadow-xl wwc:p-4">
						<div className="wwc:flex wwc:items-start wwc:gap-4">
							<div className="wwc:w-24 wwc:h-16 wwc:rounded-lg wwc:bg-muted wwc:overflow-hidden wwc:shrink-0">
								<img src={selectedCapture.thumbnail} alt="" className="wwc:w-full wwc:h-full wwc:object-cover" />
							</div>
							<div className="wwc:flex-1 wwc:min-w-0">
								<div className="wwc:flex wwc:items-start wwc:justify-between">
									<div>
										<h4 className="wwc:font-medium">{selectedCapture.type}</h4>
										<p className="wwc:text-sm wwc:text-muted-foreground">{selectedCapture.project}</p>
									</div>
									<Button
										variant="ghost"
										icon
										className="wwc:h-6 wwc:w-6 wwc:shrink-0"
										onClick={() => setSelectedCapture(null)}
									>
										<X className="wwc:h-4 wwc:w-4" />
									</Button>
								</div>
								<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:mt-2 wwc:text-xs wwc:text-muted-foreground">
									<span className="wwc:flex wwc:items-center wwc:gap-1">
										<Calendar className="wwc:h-3 wwc:w-3" />
										{selectedCapture.captureDate}
									</span>
									<span>•</span>
									<span>{selectedCapture.resolution}</span>
									<span>•</span>
									<span>{selectedCapture.coverage}</span>
								</div>
								<div className="wwc:flex wwc:gap-2 wwc:mt-3">
									<Button size="sm" variant="outline" className="wwc:h-7 wwc:text-xs">
										<Eye className="wwc:h-3 wwc:w-3" />
										View
									</Button>
									<Button size="sm" variant="outline" className="wwc:h-7 wwc:text-xs">
										<Download className="wwc:h-3 wwc:w-3" />
										Download
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}
				{/* Legend */}
				<div className="wwc:absolute wwc:top-4 wwc:right-4 wwc:bg-background/90 wwc:backdrop-blur-sm wwc:border wwc:rounded-lg wwc:px-3 wwc:py-2 wwc:text-xs">
					<div className="wwc:flex wwc:items-center wwc:gap-3">
						<span className="wwc:flex wwc:items-center wwc:gap-1.5">
							<span className="wwc:w-3 wwc:h-3 wwc:rounded-full wwc:bg-blue-500 wwc:border wwc:border-blue-600" />
							Processed
						</span>
						<span className="wwc:flex wwc:items-center wwc:gap-1.5">
							<span className="wwc:w-3 wwc:h-3 wwc:rounded-full wwc:bg-amber-500 wwc:border wwc:border-amber-600" />
							Processing
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

// Timelapse List Item
function TimelapseListItem({
	timelapse,
	isSelected,
	onClick,
}: {
	timelapse: (typeof timelapseData)[0];
	isSelected: boolean;
	onClick: () => void;
}) {
	return (
		<AssetListItem
			thumbnail={timelapse.thumbnail}
			thumbnailAlt={timelapse.title}
			overlay={
				<>
					<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center">
						<div className="wwc:flex wwc:h-8 wwc:w-8 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-background/80">
							<Play className="wwc:ml-0.5 wwc:h-3 wwc:w-3" />
						</div>
					</div>
					<div className="wwc:absolute wwc:right-1 wwc:bottom-1 wwc:rounded wwc:bg-black/70 wwc:px-1 wwc:py-0.5 wwc:text-[10px] wwc:font-medium wwc:text-white">
						{timelapse.duration}
					</div>
				</>
			}
			title={timelapse.title}
			subtitle={timelapse.project}
			selected={isSelected}
			onClick={onClick}
		>
			<span>{timelapse.frames} frames</span>
			<span>•</span>
			<span>{timelapse.endDate}</span>
		</AssetListItem>
	);
}

// Timelapse Map View with Mapbox
function TimelapseMapView({onTimelapseSelect}: {onTimelapseSelect?: (timelapse: (typeof timelapseData)[0]) => void}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProject, setSelectedProject] = useState<string | null>(null);
	const [selectedTimelapse, setSelectedTimelapse] = useState<(typeof timelapseData)[0] | null>(null);
	const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/satellite-streets-v12");
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const markersRef = useRef<mapboxgl.Marker[]>([]);

	// Get unique projects
	const projects = [...new Set(timelapseData.map((t) => t.project))];

	// Filter timelapses
	const filteredTimelapses = timelapseData.filter((timelapse) => {
		const matchesSearch =
			timelapse.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			timelapse.project.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesProject = !selectedProject || timelapse.project === selectedProject;
		return matchesSearch && matchesProject;
	});

	// Qiddiya coordinates
	const mapCenter: [number, number] = [46.365, 24.552];

	// Handle timelapse selection
	const handleTimelapseSelect = (timelapse: (typeof timelapseData)[0]) => {
		setSelectedTimelapse(timelapse);
		onTimelapseSelect?.(timelapse);

		// Fly to timelapse location
		if (timelapse.coordinates && mapRef.current) {
			mapRef.current.flyTo({
				center: timelapse.coordinates,
				zoom: 17,
				duration: 1500,
			});
		}
	};

	// Add markers
	const addMarkers = () => {
		if (!mapRef.current) return;

		// Clear existing markers
		markersRef.current.forEach((marker) => marker.remove());
		markersRef.current = [];

		// Collect bounds
		const bounds = new mapboxgl.LngLatBounds();

		filteredTimelapses.forEach((timelapse) => {
			if (!timelapse.coordinates || !mapRef.current) return;

			bounds.extend(timelapse.coordinates);

			// Create marker element
			const el = document.createElement("div");
			el.className = "timelapse-marker";
			const isSelected = selectedTimelapse?.id === timelapse.id;

			el.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #8b5cf6;
          border: 2px solid #7c3aed;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
          transition: transform 0.2s;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
      `;

			el.addEventListener("click", () => handleTimelapseSelect(timelapse));
			el.addEventListener("mouseenter", () => {
				el.querySelector("div")?.setAttribute(
					"style",
					el.querySelector("div")?.getAttribute("style")?.replace("scale(1)", "scale(1.15)") || "",
				);
			});
			el.addEventListener("mouseleave", () => {
				if (selectedTimelapse?.id !== timelapse.id) {
					el.querySelector("div")?.setAttribute(
						"style",
						el.querySelector("div")?.getAttribute("style")?.replace("scale(1.15)", "scale(1)") || "",
					);
				}
			});

			const marker = new mapboxgl.Marker({element: el, anchor: "center"})
				.setLngLat(timelapse.coordinates)
				.addTo(mapRef.current!);

			markersRef.current.push(marker);
		});

		// Fit bounds if we have timelapses
		if (!bounds.isEmpty() && mapRef.current && !selectedTimelapse) {
			mapRef.current.fitBounds(bounds, {
				padding: {top: 50, bottom: 50, left: 50, right: 50},
				maxZoom: 15,
			});
		}
	};

	// Initialize map
	useEffect(() => {
		if (!mapContainerRef.current || mapRef.current) return;

		mapboxgl.accessToken = MAPBOX_TOKEN;

		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: mapStyle,
			center: mapCenter,
			zoom: 13,
		});

		mapRef.current.on("load", () => {
			addMarkers();
		});

		return () => {
			markersRef.current.forEach((marker) => marker.remove());
			markersRef.current = [];
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	// Update markers when filters change
	useEffect(() => {
		if (mapRef.current?.loaded()) {
			addMarkers();
		}
	}, [filteredTimelapses, selectedTimelapse]);

	// Update map style
	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setStyle(mapStyle);
			mapRef.current.once("style.load", () => {
				addMarkers();
			});
		}
	}, [mapStyle]);

	const totalFrames = filteredTimelapses.reduce((sum, t) => sum + t.frames, 0);

	return (
		<div className="wwc:flex wwc:h-full wwc:overflow-hidden wwc:bg-background">
			{/* Left Panel - Timelapse List */}
			<div className="wwc:w-[340px] wwc:border-r wwc:flex wwc:flex-col wwc:shrink-0">
				{/* Header */}
				<div className="wwc:p-4 wwc:border-b wwc:space-y-3">
					<div className="wwc:flex wwc:items-center wwc:justify-between">
						<h3 className="wwc:font-semibold wwc:flex wwc:items-center wwc:gap-2">
							<Video className="wwc:h-4 wwc:w-4" />
							Time-lapses
							<Badge variant="secondary">{filteredTimelapses.length}</Badge>
						</h3>
						<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-xs wwc:text-muted-foreground">
							<span>{totalFrames.toLocaleString()} frames</span>
						</div>
					</div>
					{/* Search */}
					<div className="wwc:relative">
						<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-4 wwc:w-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
						<Input
							placeholder="Search time-lapses..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="wwc:h-9 wwc:pl-9"
						/>
					</div>
					{/* Project Filter */}
					<div className="wwc:flex wwc:flex-wrap wwc:gap-1">
						<Button
							variant={!selectedProject ? "default" : "outline"}
							size="sm"
							className="wwc:h-7 wwc:text-xs"
							onClick={() => setSelectedProject(null)}
						>
							All
						</Button>
						{projects.slice(0, 4).map((project) => (
							<Button
								key={project}
								variant={selectedProject === project ? "default" : "outline"}
								size="sm"
								className="wwc:h-7 wwc:text-xs"
								onClick={() => setSelectedProject(selectedProject === project ? null : project)}
							>
								{project.split(" ")[0]}
							</Button>
						))}
					</div>
				</div>
				{/* Timelapse List */}
				<ScrollArea className="wwc:flex-1">
					<div className="wwc:p-4 wwc:space-y-3">
						{filteredTimelapses.map((timelapse) => (
							<TimelapseListItem
								key={timelapse.id}
								timelapse={timelapse}
								isSelected={selectedTimelapse?.id === timelapse.id}
								onClick={() => handleTimelapseSelect(timelapse)}
							/>
						))}
					</div>
				</ScrollArea>
			</div>

			{/* Right Panel - Map */}
			<div className="wwc:flex-1 wwc:relative">
				<div ref={mapContainerRef} className="wwc:h-full wwc:w-full" />
				{/* Map Controls */}
				<MapControls mapRef={mapRef} mapStyle={mapStyle} onMapStyleChange={setMapStyle} />
				{/* Selected Timelapse Info */}
				{selectedTimelapse && (
					<div className="wwc:absolute wwc:bottom-4 wwc:left-4 wwc:right-4 wwc:max-w-md wwc:bg-background wwc:border wwc:rounded-lg wwc:shadow-xl wwc:p-4">
						<div className="wwc:flex wwc:items-start wwc:gap-4">
							<div className="wwc:w-24 wwc:h-16 wwc:rounded-lg wwc:bg-muted wwc:overflow-hidden wwc:shrink-0 wwc:relative">
								<img src={selectedTimelapse.thumbnail} alt="" className="wwc:w-full wwc:h-full wwc:object-cover" />
								<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center">
									<div className="wwc:w-10 wwc:h-10 wwc:rounded-full wwc:bg-background/80 wwc:flex wwc:items-center wwc:justify-center">
										<Play className="wwc:h-4 wwc:w-4 wwc:ml-0.5" />
									</div>
								</div>
							</div>
							<div className="wwc:flex-1 wwc:min-w-0">
								<div className="wwc:flex wwc:items-start wwc:justify-between">
									<div>
										<h4 className="wwc:font-medium">{selectedTimelapse.title}</h4>
										<p className="wwc:text-sm wwc:text-muted-foreground">{selectedTimelapse.project}</p>
									</div>
									<Button
										variant="ghost"
										icon
										className="wwc:h-6 wwc:w-6 wwc:shrink-0"
										onClick={() => setSelectedTimelapse(null)}
									>
										<X className="wwc:h-4 wwc:w-4" />
									</Button>
								</div>
								<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:mt-2 wwc:text-xs wwc:text-muted-foreground">
									<span>
										{selectedTimelapse.startDate} → {selectedTimelapse.endDate}
									</span>
									<span>•</span>
									<span>{selectedTimelapse.frames} frames</span>
								</div>
								<div className="wwc:flex wwc:gap-2 wwc:mt-3">
									<Button size="sm" variant="default" className="wwc:h-7 wwc:text-xs">
										<Play className="wwc:h-3 wwc:w-3" />
										Play
									</Button>
									<Button size="sm" variant="outline" className="wwc:h-7 wwc:text-xs">
										<Download className="wwc:h-3 wwc:w-3" />
										Download
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}
				{/* Legend */}
				<div className="wwc:absolute wwc:top-4 wwc:right-4 wwc:bg-background/90 wwc:backdrop-blur-sm wwc:border wwc:rounded-lg wwc:px-3 wwc:py-2 wwc:text-xs">
					<div className="wwc:flex wwc:items-center wwc:gap-1.5">
						<span className="wwc:w-3 wwc:h-3 wwc:rounded-full wwc:bg-violet-500 wwc:border wwc:border-violet-600" />
						<span>Time-lapse Location</span>
					</div>
				</div>
			</div>
		</div>
	);
}

/** CCTV cameras, drone captures, 3D scans, and time-lapse views across all projects. */
export function OrgRealityCapture({selectedOrg: _selectedOrg}: OrgRealityCaptureProps) {
	const [activeTab, setActiveTab] = useState("cameras");

	return (
		<div className="wwc:h-[calc(100vh-8rem)] wwc:flex wwc:flex-col">
			{/* Tabs Header */}
			<div className="wwc:px-4 wwc:pt-4 wwc:pb-3 wwc:border-b wwc:bg-background wwc:shrink-0">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="wwc:w-fit">
						<TabsTrigger value="cameras" className="wwc:flex wwc:items-center wwc:gap-2">
							<Camera className="wwc:h-4 wwc:w-4" />
							Live Cameras
						</TabsTrigger>
						<TabsTrigger value="drones" className="wwc:flex wwc:items-center wwc:gap-2">
							<Plane className="wwc:h-4 wwc:w-4" />
							Drone Captures
						</TabsTrigger>
						<TabsTrigger value="timelapse" className="wwc:flex wwc:items-center wwc:gap-2">
							<Video className="wwc:h-4 wwc:w-4" />
							Time-lapse
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{/* Tab Content - Full height */}
			<div className="wwc:flex-1 wwc:min-h-0">
				{activeTab === "cameras" && <CameraMapView />}
				{activeTab === "drones" && <DroneMapView />}
				{activeTab === "timelapse" && <TimelapseMapView />}
			</div>
		</div>
	);
}
