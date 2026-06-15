"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import type { Map as LeafletMap, Marker as LeafletMarker, Polyline as LeafletPolyline, TileLayer as LeafletTileLayer } from "leaflet";

interface CustomMap extends LeafletMap {
  _tileLayer?: LeafletTileLayer;
}

// Mock vehicle type definition
interface Vehicle {
  id: string;
  name: string;
  image: string;
  driverName: string;
  driverRole: string;
  driverImage: string;
  location: string;
  odometer: string;
  status: "ACTIVE" | "IDLE" | "STOP";
  speed: number;
  fuel: number;
  alerts: {
    idle: number;
    speed: number;
  };
  tripMetrics: {
    dist: string;
    duration: string;
    maxSpeed: string;
    avgSpeed: string;
    parking: string;
    idling: string;
  };
  sensors: {
    behavior: number;
    zoneA: string;
    zoneB: string;
  };
  vin: string;
  type: string;
  model: string;
  lastTripDist: string;
  lat: number; // Map coordinate Latitude
  lng: number; // Map coordinate Longitude
}

// Initial vehicles database with actual coordinates in Dubai
const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: "T 29416",
    name: "COROLLA",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqMVVe4xAI2NMh7o2KFxq30KzlblIpaj9sOLCo-vBFchQXUlm4exYhZCXQXcDdg8RkP-PIK0mnl2a0XH4AABG_AlBVwUaVDLuubS3aS4f0ui7i92xUE29Opz-3VPkQiNz_YfnF9SNo9ZT7TY-yCWMaNYqIvkdQR9xccTJSjRPvMni_sRFfojYTJcWFK6c88j3atEHbFCh4xb9OrJoBQDQX2TuEwIrOgGQ0V442wussOxslkW0JV0jxjCuXaennGnb0-BALuKVYgYs",
    driverName: "Marcus Thorne",
    driverRole: "Primary Operator",
    driverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCD0hpFIlcgk7arcHbtGa-NiE7v6QhYSULtQ_M2euRvf_pTks9Co_NfzLYYeKdU5afQMDr8UDLL99cJQjjEPAzyDATaozdnEtkkb-tubvHn62F1oHVJXsodz6KX6urBsZm8LFIAIYM4NCV9be6T1ZuObUl34DdtL2I6sqBnOnYlI98NOiRuEKPo4c5R41pLYAGsfOE4CXNt2odw8UOtIRC6yEQsAox3R-uo0AJhyztNEhE897Lgx_1Ym0ZKFKc-M3VtbiYcFEIWq8I",
    location: "Sheikh Mohammed Bin Zayed Rd, Dubai",
    odometer: "142,500 mi",
    status: "ACTIVE",
    speed: 68,
    fuel: 65,
    alerts: { idle: 0, speed: 0 },
    tripMetrics: {
      dist: "210.5 mi",
      duration: "3h 45m",
      maxSpeed: "82 km/h",
      avgSpeed: "61 km/h",
      parking: "15 min",
      idling: "2 min",
    },
    sensors: { behavior: 95, zoneA: "35.1°F", zoneB: "34.9°F" },
    vin: "4H9...302",
    type: "Compact Sedan",
    model: "2022 Toyota Corolla",
    lastTripDist: "180 mi",
    lat: 25.1685,
    lng: 55.3212,
  },
  {
    id: "T 44092",
    name: "ACTROS",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBD_NGxmvnLMhqqVOtGPLKkdlt3Y_MaR-mdNRweAdTjHjY2O3Y6vJAcUvi4lZkM6jXsBjxc-0LoT1cZEpPhGHnWrd8JOzy2bKYr9shQTLDMxLu7aWfTmjiXrzBPcfuwLd_sKfbgRr7ZVzd-WRaRHQyOAl0QVqo01Kpml3C_cMV_KCDRPGl0tb0svDk9YA86TPgIebPpB5k75xHPPi-DhzaB86UN1qy8m0bJVc6OwHHvjaG1-4-rYro0SYp8yAMgZRgfoa8O7dUTMqg",
    driverName: "Marcus Thorne",
    driverRole: "Primary Operator",
    driverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCD0hpFIlcgk7arcHbtGa-NiE7v6QhYSULtQ_M2euRvf_pTks9Co_NfzLYYeKdU5afQMDr8UDLL99cJQjjEPAzyDATaozdnEtkkb-tubvHn62F1oHVJXsodz6KX6urBsZm8LFIAIYM4NCV9be6T1ZuObUl34DdtL2I6sqBnOnYlI98NOiRuEKPo4c5R41pLYAGsfOE4CXNt2odw8UOtIRC6yEQsAox3R-uo0AJhyztNEhE897Lgx_1Ym0ZKFKc-M3VtbiYcFEIWq8I",
    location: "Jebel Ali Free Zone South, Dubai",
    odometer: "89,420 mi",
    status: "IDLE",
    speed: 0,
    fuel: 48,
    alerts: { idle: 3, speed: 1 },
    tripMetrics: {
      dist: "412.5 mi",
      duration: "6h 12m",
      maxSpeed: "72 mph",
      avgSpeed: "58 mph",
      parking: "45 min",
      idling: "12 min",
    },
    sensors: { behavior: 92, zoneA: "34.2°F", zoneB: "33.8°F" },
    vin: "WDG...592",
    type: "Heavy Duty Carrier",
    model: "2024 Mercedes Actros",
    lastTripDist: "842 mi",
    lat: 24.9857,
    lng: 55.0747,
  },
  {
    id: "T 10225",
    name: "SCANIA",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPCGewpYS3q5m85vQxofW0kIEOwXHxou78Dsvndvf0h2XYx1WDhiR_CKBA8wNftTIpEQsSZgLr4l-Wz4T5ExwBlKdQoHRhMo5XM2zRoZQcVRGy8l95DxN-6tk5y5rZ6r-NsZ5TN1BmmRjdDc3hd_So8DhA9SLTtsOsw807aQ4j2I0qtCZW_Fv9TH7RJz_128KWpCnW8bU7PkdYJV02aRtr3Bs9vKpC1-GJNsNnQjykOy113O0dMPb3v1zN6SzLxk_jYguMOnc2lZM",
    driverName: "Sarah Connor",
    driverRole: "Secondary Operator",
    driverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjjN7Y7EJHl7wvDq2vvL-a1Ynrdpi8uWFRmO3IXw4F-j38XiA8w4pvO4VhjoeK4vaV2K8b_kTRCAYiiGRxZ0O4MEayso9qWd6yeCOHty8zXysBERvDUWPVBsUXFZl5OPHpYdIi16C64mqsggpPARouN7UoV1g5omEOsVS-28XfUCdwPqswbPvQsbNJcTiMIxgxhqkilYIzc6Hgd7l2vkbWL9BjaKzJ_qbyOaVhlcep3Th0yc6hrWo1ZiMrSmgYuhPhaGLoPDgq_hs",
    location: "Al Khail Road, Exit 12, Dubai",
    odometer: "215,800 mi",
    status: "ACTIVE",
    speed: 92,
    fuel: 82,
    alerts: { idle: 1, speed: 2 },
    tripMetrics: {
      dist: "520.1 mi",
      duration: "8h 15m",
      maxSpeed: "95 km/h",
      avgSpeed: "63 km/h",
      parking: "30 min",
      idling: "8 min",
    },
    sensors: { behavior: 88, zoneA: "36.0°F", zoneB: "35.5°F" },
    vin: "YS2...911",
    type: "Heavy Duty Hauler",
    model: "2023 Scania R500",
    lastTripDist: "910 mi",
    lat: 25.1412,
    lng: 55.2334,
  },
  {
    id: "T 8821",
    name: "SARAH",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqMVVe4xAI2NMh7o2KFxq30KzlblIpaj9sOLCo-vBFchQXUlm4exYhZCXQXcDdg8RkP-PIK0mnl2a0XH4AABG_AlBVwUaVDLuubS3aS4f0ui7i92xUE29Opz-3VPkQiNz_YfnF9SNo9ZT7TY-yCWMaNYqIvkdQR9xccTJSjRPvMni_sRFfojYTJcWFK6c88j3atEHbFCh4xb9OrJoBQDQX2TuEwIrOgGQ0V442wussOxslkW0JV0jxjCuXaennGnb0-BALuKVYgYs",
    driverName: "Sarah Connor",
    driverRole: "Primary Operator",
    driverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjjN7Y7EJHl7wvDq2vvL-a1Ynrdpi8uWFRmO3IXw4F-j38XiA8w4pvO4VhjoeK4vaV2K8b_kTRCAYiiGRxZ0O4MEayso9qWd6yeCOHty8zXysBERvDUWPVBsUXFZl5OPHpYdIi16C64mqsggpPARouN7UoV1g5omEOsVS-28XfUCdwPqswbPvQsbNJcTiMIxgxhqkilYIzc6Hgd7l2vkbWL9BjaKzJ_qbyOaVhlcep3Th0yc6hrWo1ZiMrSmgYuhPhaGLoPDgq_hs",
    location: "Dubai Marina, Dubai",
    odometer: "42,310 mi",
    status: "ACTIVE",
    speed: 45,
    fuel: 75,
    alerts: { idle: 0, speed: 0 },
    tripMetrics: {
      dist: "95.4 mi",
      duration: "2h 10m",
      maxSpeed: "80 km/h",
      avgSpeed: "48 km/h",
      parking: "10 min",
      idling: "1 min",
    },
    sensors: { behavior: 98, zoneA: "33.5°F", zoneB: "33.0°F" },
    vin: "4H9...821",
    type: "Electric Delivery Van",
    model: "2024 Rivian EDV",
    lastTripDist: "110 mi",
    lat: 25.0805,
    lng: 55.1403,
  },
];

// Define route details database for visualization
const ROUTE_DETAILS: {
  [key: string]: {
    origin: string;
    destination: string;
    originLatlng: [number, number];
    destLatlng: [number, number];
    path: [number, number][];
  };
} = {
  "T 29416": {
    origin: "DXB Airport",
    destination: "Dubai Investment Park",
    originLatlng: [25.2532, 55.3657],
    destLatlng: [24.9857, 55.1500],
    path: [
      [25.2532, 55.3657],
      [25.2200, 55.3400],
      [25.1800, 55.3100],
      [25.1685, 55.3212], // Near Sheikh Mohammed Bin Zayed Rd
      [25.1200, 55.2800],
      [25.0500, 55.2200],
      [24.9857, 55.1500],
    ],
  },
  "T 44092": {
    origin: "Jebel Ali Port",
    destination: "Abu Dhabi Port",
    originLatlng: [25.0112, 55.0617],
    destLatlng: [24.5161, 54.3812],
    path: [
      [25.0112, 55.0617],
      [24.9857, 55.0747], // Jebel Ali Free Zone
      [24.8500, 54.9500],
      [24.7000, 54.7500],
      [24.5800, 54.5500],
      [24.5161, 54.3812],
    ],
  },
  "T 10225": {
    origin: "Dubai Industrial City",
    destination: "Sharjah Airport",
    originLatlng: [24.8500, 55.0800],
    destLatlng: [25.3286, 55.5172],
    path: [
      [24.8500, 55.0800],
      [24.9500, 55.1500],
      [25.0500, 55.2000],
      [25.1412, 55.2334], // Al Khail Road
      [25.2200, 55.3200],
      [25.2800, 55.4200],
      [25.3286, 55.5172],
    ],
  },
  "T 8821": {
    origin: "Palm Jumeirah",
    destination: "Dubai Marina Mall",
    originLatlng: [25.1124, 55.1390],
    destLatlng: [25.0777, 55.1403],
    path: [
      [25.1124, 55.1390],
      [25.0950, 55.1500],
      [25.0805, 55.1403], // Dubai Marina
      [25.0777, 55.1403],
    ],
  },
};

// Helper function to find the index of the path coordinate closest to the current location
function findClosestPointIndex(path: [number, number][], current: [number, number]): number {
  let minDistance = Infinity;
  let closestIndex = 0;
  for (let i = 0; i < path.length; i++) {
    const dist = Math.pow(path[i][0] - current[0], 2) + Math.pow(path[i][1] - current[1], 2);
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
    }
  }
  return closestIndex;
}

export default function Home() {
  // Main states
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "IDLE" | "STOP">("ALL");

  // Customize floating panel checkboxes
  const [displayFields, setDisplayFields] = useState({
    address: true,
    odometer: true,
    temperature: false,
  });
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Time-sync simulation states
  const [countdown, setCountdown] = useState(30);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [syncDiffSeconds, setSyncDiffSeconds] = useState(0);

  // Active Map View settings
  const [satelliteView, setSatelliteView] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(11);

  // Map state and tracking refs
  const [map, setMap] = useState<LeafletMap | null>(null);
  const markersRef = useRef<{ [key: string]: LeafletMarker }>({});
  const prevSelectedIdRef = useRef<string | null>(null);
  const routePolylinesRef = useRef<LeafletPolyline[]>([]);
  const routeMarkersRef = useRef<LeafletMarker[]>([]);

  // Find currently selected vehicle object
  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  // Simulation loop for live telemetry updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger mock sync update
          setLastSyncTime(new Date());
          setVehicles((prevVehicles) =>
            prevVehicles.map((v) => {
              if (v.status === "ACTIVE") {
                // Adjust speed slightly to show live updates
                const deltaSpeed = Math.floor(Math.random() * 5) - 2;
                const newSpeed = Math.max(20, Math.min(120, v.speed + deltaSpeed));
                
                // Move coordinates slightly (approx 0.0008 deg)
                const latShift = (Math.random() - 0.5) * 0.0016;
                const lngShift = (Math.random() - 0.5) * 0.0016;
                
                return {
                  ...v,
                  speed: newSpeed,
                  lat: v.lat + latShift,
                  lng: v.lng + lngShift,
                };
              }
              return v;
            })
          );
          return 30; // reset countdown
        }
        return prev - 1;
      });

      // Update seconds since last sync
      const diff = Math.floor((new Date().getTime() - lastSyncTime.getTime()) / 1000);
      setSyncDiffSeconds(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [lastSyncTime]);

  // Map Initialization useEffect (safely handles React Strict Mode)
  useEffect(() => {
    let active = true;
    let mapInstance: LeafletMap | null = null;

    const setupMap = async () => {
      const L = (await import("leaflet")).default;
      if (!active) return;

      const container = document.getElementById("map-container");
      if (!container) return;

      // Initialize Leaflet Map
      mapInstance = L.map("map-container", {
        zoomControl: false,
        attributionControl: false,
      }).setView([25.12, 55.2], 11);

      // Custom base layer layer (default to vector map)
      const baseLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 18 }
      ).addTo(mapInstance);

      Object.assign(mapInstance, { _tileLayer: baseLayer });

      // Sync zoom state
      mapInstance.on("zoomend", () => {
        setZoomLevel(mapInstance!.getZoom());
      });

      setMap(mapInstance);
    };

    setupMap();

    return () => {
      active = false;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // Update map layer on theme toggle (vector vs satellite)
  useEffect(() => {
    if (map) {
      const customMap = map as CustomMap;
      if (customMap._tileLayer) {
        map.removeLayer(customMap._tileLayer);
      }

      import("leaflet").then((LModule) => {
        const L = LModule.default;
        const newLayer = L.tileLayer(
          satelliteView
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          { maxZoom: 18 }
        ).addTo(map);
        customMap._tileLayer = newLayer;
      });
    }
  }, [map, satelliteView]);

  // Update markers coordinates, active outline rings, and route path polylines
  useEffect(() => {
    if (!map) return;

    const activeMarkers: { [key: string]: LeafletMarker } = {};

    import("leaflet").then((LModule) => {
      const L = LModule.default;

      vehicles.forEach((v) => {
        const isSelected = v.id === selectedVehicleId;
        const latlng: [number, number] = [v.lat, v.lng];

        // Create Custom HTML Pin Marker
        const iconHtml = `
          <div class="relative flex flex-col items-center">
            <!-- Name tag on hover or selection -->
            <div class="absolute bottom-full mb-2 bg-white/95 px-2 py-0.5 rounded-full shadow-lg border border-primary/20 pointer-events-none whitespace-nowrap opacity-0 transition-opacity duration-200 ${
              isSelected ? "opacity-100 scale-100" : ""
            } group-hover:opacity-100" style="transform: translateY(-2px)">
              <p class="text-[9px] text-[#4f46e5] font-bold">#${v.id.split(" ")[1]} • ${v.name}</p>
            </div>
            
            <!-- Map Pin Circle -->
            <div class="w-9 h-9 rounded-full bg-white border-2 shadow-xl flex items-center justify-center overflow-hidden transition-all duration-300 ${
              isSelected
                ? "border-[#4f46e5] scale-110 ring-4 ring-[#4f46e5]/25"
                : v.status === "ACTIVE"
                ? "border-emerald-500 animate-pulse"
                : v.status === "IDLE"
                ? "border-amber-500"
                : "border-red-500"
            }">
              <img src="${v.image}" class="w-full h-full object-cover" style="object-fit: cover;" alt="" />
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "group custom-marker-pin",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker(latlng, { icon: customIcon })
          .addTo(map)
          .on("click", () => {
            setSelectedVehicleId(v.id);
          });
          
        activeMarkers[v.id] = marker;
      });

      // Draw route for selected vehicle
      if (selectedVehicleId && ROUTE_DETAILS[selectedVehicleId]) {
        const details = ROUTE_DETAILS[selectedVehicleId];
        const active = vehicles.find((v) => v.id === selectedVehicleId);
        if (active) {
          const currentLoc: [number, number] = [active.lat, active.lng];
          const closestIndex = findClosestPointIndex(details.path, currentLoc);
          
          const completedPath = [...details.path.slice(0, closestIndex + 1), currentLoc];
          const remainingPath = [currentLoc, ...details.path.slice(closestIndex + 1)];

          const completedPolyline = L.polyline(completedPath, {
            color: "#4f46e5",
            weight: 4,
            opacity: 0.8,
            lineCap: "round",
            lineJoin: "round"
          }).addTo(map);

          const remainingPolyline = L.polyline(remainingPath, {
            color: "#94a3b8",
            weight: 3,
            opacity: 0.6,
            dashArray: "6, 6",
            lineCap: "round",
            lineJoin: "round"
          }).addTo(map);

          routePolylinesRef.current.push(completedPolyline, remainingPolyline);

          // Add Start Marker
          const startMarker = L.marker(details.originLatlng, {
            icon: L.divIcon({
              html: `
                <div class="relative flex flex-col items-center group">
                  <div class="absolute bottom-full mb-1 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap uppercase tracking-wider">
                    Origin: ${details.origin}
                  </div>
                  <div class="w-3 h-3 rounded-full bg-white border-[3.5px] border-slate-950 shadow-md"></div>
                </div>
              `,
              className: "custom-route-start",
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            })
          }).addTo(map);

          // Add End Marker
          const endMarker = L.marker(details.destLatlng, {
            icon: L.divIcon({
              html: `
                <div class="relative flex flex-col items-center group">
                  <div class="absolute bottom-full mb-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap uppercase tracking-wider">
                    Dest: ${details.destination}
                  </div>
                  <div class="w-3 h-3 rounded-full bg-white border-[3.5px] border-[#4f46e5] shadow-md"></div>
                </div>
              `,
              className: "custom-route-end",
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            })
          }).addTo(map);

          routeMarkersRef.current.push(startMarker, endMarker);
        }
      }

      // Track markers ref for updates
      markersRef.current = activeMarkers;

      // Handle pan / zoom transitions on selected ID change
      const selectionChanged = selectedVehicleId !== prevSelectedIdRef.current;
      prevSelectedIdRef.current = selectedVehicleId;

      if (selectedVehicleId && selectionChanged) {
        const active = vehicles.find((v) => v.id === selectedVehicleId);
        const details = ROUTE_DETAILS[selectedVehicleId];
        if (active && details) {
          const bounds = L.latLngBounds([
            details.originLatlng,
            [active.lat, active.lng],
            details.destLatlng
          ]);
          map.fitBounds(bounds, { padding: [80, 80] });
        } else if (active) {
          map.setView([active.lat, active.lng], 13);
        }
      }
    });

    return () => {
      // Cleanup all layers when effects re-run or unmount
      Object.values(markersRef.current).forEach((marker) => {
        if (map) map.removeLayer(marker);
      });
      markersRef.current = {};

      routePolylinesRef.current.forEach((layer) => {
        if (map) map.removeLayer(layer);
      });
      routePolylinesRef.current = [];

      routeMarkersRef.current.forEach((layer) => {
        if (map) map.removeLayer(layer);
      });
      routeMarkersRef.current = [];
    };
  }, [map, vehicles, selectedVehicleId]);

  // Zoom Button interactions
  const handleZoomIn = () => {
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
  };

  // Recenter controls
  const handleRecenter = () => {
    if (map) {
      if (selectedVehicle) {
        map.setView([selectedVehicle.lat, selectedVehicle.lng], 13);
      } else {
        map.setView([25.12, 55.2], 11);
      }
    }
  };

  // Filters logic
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || vehicle.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

  // Summary statistics
  const stats = useMemo(() => {
    const activeCount = vehicles.filter((v) => v.status === "ACTIVE").length;
    const idleCount = vehicles.filter((v) => v.status === "IDLE").length;
    const stopCount = vehicles.filter((v) => v.status === "STOP").length;
    return {
      active: activeCount,
      idle: idleCount,
      stop: stopCount,
      total: vehicles.length,
    };
  }, [vehicles]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface text-on-surface select-none font-outfit">
      
      {/* TopNavBar */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center w-full px-container-padding h-16 shrink-0 z-50">
        <div className="flex items-center gap-stack-lg">
          <div className="relative h-8 w-36 flex items-center">
            <Image
              src="/logo.png"
              alt="TouchTrack Logo"
              fill
              sizes="144px"
              priority
              className="object-contain"
            />
          </div>
          
          {/* Global Status Chips */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-bold text-emerald-700 tracking-tight font-outfit">{stats.active} ACTIVE</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span className="text-[11px] font-bold text-slate-500 tracking-tight font-outfit">{stats.idle} IDLE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-stack-md">
          {/* Global Search */}
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50/55 border border-slate-200/50 rounded-full pl-10 pr-4 py-1.5 text-sm w-64 text-on-surface placeholder:text-slate-400 focus:ring-2 focus:ring-primary/10 focus:outline-none focus:border-primary/30 transition-all font-outfit"
              placeholder="Search fleet..."
            />
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-500 hover:bg-slate-100/50 transition-colors rounded-full relative">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-white"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100/50 transition-colors rounded-full">
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </button>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface tracking-tight uppercase">M. CHASE</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Fleet Manager</p>
            </div>
            <div className="relative w-8 h-8 rounded-full border border-primary/10 overflow-hidden">
              <Image
                alt="Fleet Manager Profile"
                fill
                sizes="32px"
                className="object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD0hpFIlcgk7arcHbtGa-NiE7v6QhYSULtQ_M2euRvf_pTks9Co_NfzLYYeKdU5afQMDr8UDLL99cJQjjEPAzyDATaozdnEtkkb-tubvHn62F1oHVJXsodz6KX6urBsZm8LFIAIYM4NCV9be6T1ZuObUl34DdtL2I6sqBnOnYlI98NOiRuEKPo4c5R41pLYAGsfOE4CXNt2odw8UOtIRC6yEQsAox3R-uo0AJhyztNEhE897Lgx_1Ym0ZKFKc-M3VtbiYcFEIWq8I"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SideNavBar (Minimal Rail) */}
        <aside className="bg-white/40 h-full w-20 flex-shrink-0 border-r border-slate-100/50 flex flex-col items-center py-6 gap-6 z-10">
          <nav className="flex-1 flex flex-col gap-4 items-center w-full">
            <a className="flex items-center justify-center w-11 h-11 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105" href="#" title="Live Map">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
            </a>
            <a className="flex items-center justify-center w-11 h-11 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all" href="#" title="Fleet Status">
              <span className="material-symbols-outlined text-[22px]">local_shipping</span>
            </a>
            <a className="flex items-center justify-center w-11 h-11 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all" href="#" title="Analytics">
              <span className="material-symbols-outlined text-[22px]">monitoring</span>
            </a>
            <a className="flex items-center justify-center w-11 h-11 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all" href="#" title="Maintenance">
              <span className="material-symbols-outlined text-[22px]">build</span>
            </a>
            
            <div className="mt-4 pt-4 border-t border-slate-100 w-10 flex flex-col items-center">
              <button
                onClick={() => {
                  alert("Unit deploy process initialized. Select terminal coordinate.");
                }}
                className="w-11 h-11 bg-slate-900 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
                title="Deploy Unit"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Map Main Area */}
        <main className="flex-1 relative bg-slate-50 overflow-hidden">
          
          {/* Leaflet Map Container */}
          <div id="map-container" className="absolute inset-0 z-0 h-full w-full bg-slate-100" />
          <div className="absolute inset-0 map-vignette pointer-events-none z-10"></div>

          {/* Floating Vehicle Panel */}
          <div className="absolute top-6 left-6 bottom-6 w-80 z-20 flex flex-col gap-4">
            <div className="glass-panel rounded-3xl p-5 flex flex-col h-full floating-ui overflow-hidden">
              
              {/* Conditional Panel Rendering: List vs Detail */}
              {!selectedVehicle ? (
                <>
                  {/* Fleet List Panel */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                    </div>
                    
                    {/* Search inside floating panel for mobile/compact view */}
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">search</span>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/50 border border-white/80 rounded-2xl pl-9 pr-4 py-2 text-xs text-on-surface focus:ring-0 focus:outline-none transition-all placeholder:text-slate-400"
                        placeholder="Filter vehicles..."
                      />
                    </div>

                    <div className="flex items-center justify-between mt-3 px-1 py-1.5 border-t border-white/30">
                      <div className="flex items-center gap-1">
                        <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/50 text-slate-500 transition-colors">
                          <span className="material-symbols-outlined text-[16px]">pause</span>
                        </button>
                        <button
                          onClick={() => {
                            setLastSyncTime(new Date());
                            setCountdown(30);
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/50 text-slate-500 transition-colors"
                          title="Force Refresh Data"
                        >
                          <span className="material-symbols-outlined text-[16px]">refresh</span>
                        </button>
                        <span className="text-[9px] font-mono text-slate-400 ml-1 font-medium">{countdown}s</span>
                      </div>
                      
                      <div className="flex items-center gap-1 cursor-pointer hover:bg-white/50 px-1.5 py-0.5 rounded transition-colors">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Auto: 30s</span>
                        <span className="material-symbols-outlined text-[12px] text-slate-400">expand_more</span>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
                          className={`w-6 h-6 flex items-center justify-center rounded hover:bg-white/50 transition-colors ml-1 ${isCustomizeOpen ? "bg-white/60 text-primary" : "text-slate-500"}`}
                          title="Customization"
                        >
                          <span className="material-symbols-outlined text-[16px]">tune</span>
                        </button>
                        
                        {/* Customization Dropdown */}
                        {isCustomizeOpen && (
                          <div className="absolute right-0 top-full mt-2 w-40 glass-panel rounded-xl p-3 shadow-xl border border-white/80 z-50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Display Fields</p>
                            <div className="flex flex-col gap-2">
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50/50 p-1 rounded transition-colors">
                                <input
                                  type="checkbox"
                                  checked={displayFields.address}
                                  onChange={(e) => setDisplayFields({ ...displayFields, address: e.target.checked })}
                                  className="w-3 h-3 rounded border-slate-300 text-primary focus:ring-primary/20 bg-transparent"
                                />
                                <span className="text-[11px] text-slate-600">Address</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50/50 p-1 rounded transition-colors">
                                <input
                                  type="checkbox"
                                  checked={displayFields.odometer}
                                  onChange={(e) => setDisplayFields({ ...displayFields, odometer: e.target.checked })}
                                  className="w-3 h-3 rounded border-slate-300 text-primary focus:ring-primary/20 bg-transparent"
                                />
                                <span className="text-[11px] text-slate-600">Odometer</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50/50 p-1 rounded transition-colors">
                                <input
                                  type="checkbox"
                                  checked={displayFields.temperature}
                                  onChange={(e) => setDisplayFields({ ...displayFields, temperature: e.target.checked })}
                                  className="w-3 h-3 rounded border-slate-300 text-primary focus:ring-primary/20 bg-transparent"
                                />
                                <span className="text-[11px] text-slate-600">Cargo Temp</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Filter Status buttons */}
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
                      <button
                        onClick={() => setStatusFilter("ALL")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors border ${statusFilter === "ALL" ? "bg-primary/10 border-primary/30 text-primary" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"}`}
                      >
                        ALL ({vehicles.length})
                      </button>
                      <button
                        onClick={() => setStatusFilter("ACTIVE")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors border ${statusFilter === "ACTIVE" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">navigation</span>
                        {stats.active}
                      </button>
                      <button
                        onClick={() => setStatusFilter("IDLE")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors border ${statusFilter === "IDLE" ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">pause</span>
                        {stats.idle}
                      </button>
                    </div>
                  </div>

                  {/* Vehicles List Container */}
                  <div className="flex-1 overflow-y-auto pr-1 -mr-1 no-scrollbar border-t border-slate-100/50">
                    {filteredVehicles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="material-symbols-outlined text-[36px] text-slate-300 mb-2">local_shipping</span>
                        <p className="text-xs font-bold text-slate-400">No vehicles match filters.</p>
                      </div>
                    ) : (
                      filteredVehicles.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          onClick={() => setSelectedVehicleId(vehicle.id)}
                          className="group cursor-pointer border-b border-slate-100 last:border-b-0"
                        >
                          <div className="p-3 hover:bg-slate-50/80 transition-colors">
                            <div className="flex items-start gap-3">
                              {/* Vehicle Image */}
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden border shrink-0 mt-0.5 relative ${vehicle.status === "ACTIVE" ? "bg-emerald-50 border-emerald-100" : vehicle.status === "IDLE" ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-100"}`}>
                                <Image
                                  alt={vehicle.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                  src={vehicle.image}
                                />
                              </div>
                              
                              {/* Details text */}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p className="font-bold text-[12px] text-slate-800 truncate">{vehicle.id} | {vehicle.name}</p>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="material-symbols-outlined text-slate-400 text-[18px] hover:text-primary cursor-pointer">expand_more</span>
                                    <span className="material-symbols-outlined text-slate-400 text-[18px] hover:text-primary cursor-pointer">more_vert</span>
                                  </div>
                                </div>
                                
                                {/* Display fields controlled by tune setting */}
                                <div className="flex flex-col gap-0.5 mt-0.5 mb-1.5">
                                  {displayFields.address && (
                                    <div className="flex items-center gap-1 text-slate-500">
                                      <span className="material-symbols-outlined text-[12px] shrink-0">location_on</span>
                                      <span className="text-[10px] truncate">{vehicle.location}</span>
                                    </div>
                                  )}
                                  {displayFields.odometer && (
                                    <div className="flex items-center gap-1 text-slate-500">
                                      <span className="material-symbols-outlined text-[12px] shrink-0">speed</span>
                                      <span className="text-[10px]">{vehicle.odometer}</span>
                                    </div>
                                  )}
                                  {displayFields.temperature && (
                                    <div className="flex items-center gap-1 text-slate-500">
                                      <span className="material-symbols-outlined text-[12px] shrink-0">thermostat</span>
                                      <span className="text-[10px] text-amber-600 font-mono">Zone A: {vehicle.sensors.zoneA}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${vehicle.status === "ACTIVE" ? "bg-emerald-500" : vehicle.status === "IDLE" ? "bg-slate-400" : "bg-red-500"}`}></span>
                                    <span className="text-[10px] text-slate-400 truncate font-mono">
                                      {vehicle.status === "ACTIVE" ? "Live" : vehicle.status === "IDLE" ? "Idle" : "Stop"}
                                    </span>
                                  </div>
                                  <span className={`text-[10px] font-bold ${vehicle.status === "ACTIVE" ? "text-emerald-600" : "text-amber-600"}`}>
                                    {vehicle.speed > 0 ? `${vehicle.speed} km/h` : "0 km/h"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex h-full overflow-hidden w-full">
                  
                  {/* Shrunken List Column */}
                  <div className="w-20 border-r border-slate-100/50 flex flex-col gap-4 py-2 overflow-y-auto pr-2 shrink-0 no-scrollbar">
                    {vehicles.map((v) => {
                      const isSelected = v.id === selectedVehicleId;
                      return (
                        <div
                          key={`shrink-${v.id}`}
                          onClick={() => setSelectedVehicleId(v.id)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mx-auto cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "ring-2 ring-primary ring-offset-2 opacity-100 scale-105"
                              : "opacity-50 hover:opacity-85"
                          } ${
                            v.status === "ACTIVE"
                              ? "bg-emerald-50 border border-emerald-100"
                              : v.status === "IDLE"
                              ? "bg-amber-50 border border-amber-100"
                              : "bg-slate-50 border border-slate-100"
                          }`}
                          title={`${v.id} | ${v.name}`}
                        >
                          <div className="w-10 h-10 relative rounded-lg overflow-hidden">
                            <Image
                              alt={v.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                              src={v.image}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Fleet Details Panel Column */}
                  <div className="flex-1 flex flex-col min-w-0 pl-4 h-full overflow-hidden">
                    
                    {/* Header Controls */}
                    <div className="flex items-center justify-between mb-4 pt-2 shrink-0">
                      <button
                        onClick={() => setSelectedVehicleId(null)}
                        className="p-1.5 -ml-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-1 group"
                        title="Back to fleet list"
                      >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Fleet</span>
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-on-surface hover:bg-slate-100 transition-colors rounded-lg">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </div>
                    
                    {/* Scrollable details view content */}
                    <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-6 no-scrollbar">
                      
                      {/* Vehicle Splash Card */}
                      <div>
                        <div className="mb-4 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative h-32 w-full">
                          <Image
                            alt={selectedVehicle.name}
                            fill
                            className="object-cover"
                            src={selectedVehicle.image}
                          />
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${selectedVehicle.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : selectedVehicle.status === "IDLE" ? "bg-amber-500" : "bg-red-500"}`}></span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedVehicle.status === "ACTIVE" ? "text-emerald-600" : selectedVehicle.status === "IDLE" ? "text-amber-600" : "text-red-500"}`}>
                            {selectedVehicle.status === "ACTIVE" ? "Live" : selectedVehicle.status.toLowerCase()}
                          </span>
                        </div>
                        <h3 className="text-[16px] font-bold text-slate-800 leading-tight">{selectedVehicle.id} | {selectedVehicle.name}</h3>
                        <div className="flex items-center gap-1 mt-1 text-slate-500">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          <span className="text-[10px] truncate">{selectedVehicle.location}</span>
                        </div>
                      </div>

                      {/* Main Action Buttons */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => alert(`Map tracking locked on vehicle ${selectedVehicle.id}`)}
                          className="flex-1 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 flex items-center justify-center gap-1 hover:bg-slate-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">lock_open</span> Lock
                        </button>
                        <button
                          onClick={() => alert(`Generated coordinate share link for ${selectedVehicle.id}`)}
                          className="flex-1 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 flex items-center justify-center gap-1 hover:bg-slate-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">share</span> Share
                        </button>
                        <button
                          onClick={() => alert(`Report downloaded for ${selectedVehicle.id}`)}
                          className="flex-1 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 flex items-center justify-center gap-1 hover:bg-slate-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">description</span> Report
                        </button>
                      </div>

                      {/* Current Location card */}
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Current Location</p>
                          <span className="text-[9px] font-medium text-slate-400">Updated {syncDiffSeconds}s ago</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 leading-tight">{selectedVehicle.location}</p>
                      </div>

                      {/* Operational Alerts */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-orange-50 rounded-2xl p-3 border border-orange-100">
                          <p className="text-[9px] font-bold text-orange-600 uppercase mb-1">Excessive Idle</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-orange-700">{selectedVehicle.alerts.idle}</span>
                            <span className="text-[10px] text-orange-500 font-medium">Alerts</span>
                          </div>
                        </div>
                        <div className="bg-rose-50 rounded-2xl p-3 border border-rose-100">
                          <p className="text-[9px] font-bold text-rose-600 uppercase mb-1">Overspeed</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-rose-700">{selectedVehicle.alerts.speed}</span>
                            <span className="text-[10px] text-rose-500 font-medium">Today</span>
                          </div>
                        </div>
                      </div>

                      {/* Telemetry Gauge Grid */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Live Speed</p>
                          <p className="text-lg font-bold text-slate-800">{selectedVehicle.speed} <span className="text-xs font-medium text-slate-400">KM/H</span></p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Current Fuel</p>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-slate-800">{selectedVehicle.fuel}%</p>
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden shrink-0">
                              <div
                                className={`h-full transition-all duration-500 ${selectedVehicle.fuel < 25 ? "bg-red-500" : selectedVehicle.fuel < 50 ? "bg-orange-500" : "bg-primary"}`}
                                style={{ width: `${selectedVehicle.fuel}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Trip Metrics Table */}
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Trip Metrics (Today)</p>
                        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden text-xs">
                          <div className="grid grid-cols-2 border-b border-slate-50">
                            <div className="p-3 border-r border-slate-50">
                              <p className="text-[9px] text-slate-400 uppercase mb-0.5">Total Dist</p>
                              <p className="font-bold text-slate-800">{selectedVehicle.tripMetrics.dist}</p>
                            </div>
                            <div className="p-3">
                              <p className="text-[9px] text-slate-400 uppercase mb-0.5">Duration</p>
                              <p className="font-bold text-slate-800">{selectedVehicle.tripMetrics.duration}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 border-b border-slate-50">
                            <div className="p-3 border-r border-slate-50">
                              <p className="text-[9px] text-slate-400 uppercase mb-0.5">Max Speed</p>
                              <p className="font-bold text-slate-800">{selectedVehicle.tripMetrics.maxSpeed}</p>
                            </div>
                            <div className="p-3">
                              <p className="text-[9px] text-slate-400 uppercase mb-0.5">Avg Speed</p>
                              <p className="font-bold text-slate-800">{selectedVehicle.tripMetrics.avgSpeed}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="p-3 border-r border-slate-50">
                              <p className="text-[9px] text-slate-400 uppercase mb-0.5">Parking</p>
                              <p className="font-bold text-slate-800">{selectedVehicle.tripMetrics.parking}</p>
                            </div>
                            <div className="p-3">
                              <p className="text-[9px] text-slate-400 uppercase mb-0.5">Idling</p>
                              <p className="font-bold text-slate-800">{selectedVehicle.tripMetrics.idling}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Usage Graph mockup */}
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Usage History (24H)</p>
                        <div className="h-16 flex items-end gap-1 px-1">
                          <div className="flex-1 bg-slate-100 rounded-t-sm h-[30%] hover:bg-primary/40 transition-colors"></div>
                          <div className="flex-1 bg-slate-100 rounded-t-sm h-[45%] hover:bg-primary/40 transition-colors"></div>
                          <div className="flex-1 bg-primary/40 rounded-t-sm h-[80%] hover:bg-primary/60 transition-colors"></div>
                          <div className="flex-1 bg-primary/40 rounded-t-sm h-[90%] hover:bg-primary/60 transition-colors"></div>
                          <div className="flex-1 bg-primary rounded-t-sm h-[100%] hover:bg-primary-container transition-colors"></div>
                          <div className="flex-1 bg-primary rounded-t-sm h-[85%] hover:bg-primary-container transition-colors"></div>
                          <div className="flex-1 bg-slate-100 rounded-t-sm h-[40%] hover:bg-primary/40 transition-colors"></div>
                          <div className="flex-1 bg-slate-100 rounded-t-sm h-[20%] hover:bg-primary/40 transition-colors"></div>
                          <div className="flex-1 bg-slate-100 rounded-t-sm h-[10%] hover:bg-primary/40 transition-colors"></div>
                          <div className="flex-1 bg-primary/40 rounded-t-sm h-[50%] hover:bg-primary/60 transition-colors"></div>
                          <div className="flex-1 bg-primary rounded-t-sm h-[75%] hover:bg-primary-container transition-colors"></div>
                          <div className="flex-1 bg-primary rounded-t-sm h-[60%] hover:bg-primary-container transition-colors"></div>
                        </div>
                      </div>

                      {/* Advanced Sensors Info */}
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Sensors & Behavior</p>
                        <div className="space-y-3">
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-bold text-slate-600">Driver Behavior</span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold">{selectedVehicle.sensors.behavior}/100</span>
                            </div>
                            <div className="flex gap-3">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                <span className="text-[10px] text-slate-500">Smooth Braking</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                <span className="text-[10px] text-slate-500">No Hard Turns</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Cargo Temp Sensors</p>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div className="flex justify-between bg-white/50 p-1 rounded">
                                <span className="text-slate-500">Zone A</span>
                                <span className="font-bold text-slate-800">{selectedVehicle.sensors.zoneA}</span>
                              </div>
                              <div className="flex justify-between bg-white/50 p-1 rounded">
                                <span className="text-slate-500">Zone B</span>
                                <span className="font-bold text-slate-800">{selectedVehicle.sensors.zoneB}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Route Progress bar */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2">
                          <span>Origin (DXB)</span>
                          <span>Destination (AUH)</span>
                        </div>
                        <div className="relative h-1 bg-slate-100 rounded-full">
                          <div className="absolute left-0 top-0 h-full bg-primary rounded-full w-[70%]"></div>
                          <div className="absolute left-[70%] top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 border-primary rounded-full"></div>
                        </div>
                      </div>

                      {/* Specifications Details */}
                      <div className="mb-6 pt-4 border-t border-slate-100/50">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Specs</p>
                          <button
                            onClick={() => alert("Configure Geo-fence polygon bounds on map")}
                            className="text-[9px] font-bold text-primary hover:underline"
                          >
                            + ADD GEOFENCE
                          </button>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between hover:bg-slate-50/50 p-1 rounded"><span className="text-slate-500">Vehicle Type</span><span className="font-bold text-slate-800">{selectedVehicle.type}</span></div>
                          <div className="flex justify-between hover:bg-slate-50/50 p-1 rounded"><span className="text-slate-500">Model</span><span className="font-bold text-slate-800">{selectedVehicle.model}</span></div>
                          <div className="flex justify-between hover:bg-slate-50/50 p-1 rounded"><span className="text-slate-500">VIN</span><span className="font-mono text-slate-800">{selectedVehicle.vin}</span></div>
                          <div className="flex justify-between hover:bg-slate-50/50 p-1 rounded"><span className="text-slate-500">Odometer Reading</span><span className="font-bold text-slate-800 font-mono">{selectedVehicle.odometer}</span></div>
                          <div className="flex justify-between hover:bg-slate-50/50 p-1 rounded"><span className="text-slate-500">Last Leg Dist.</span><span className="font-bold text-slate-800 font-mono">{selectedVehicle.lastTripDist}</span></div>
                        </div>
                      </div>
                      
                    </div>

                    {/* Driver Context Footer details */}
                    <div className="mt-auto pt-4 border-t border-slate-100 shrink-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 overflow-hidden relative">
                            <Image
                              alt={selectedVehicle.driverName}
                              fill
                              sizes="32px"
                              className="object-cover"
                              src={selectedVehicle.driverImage}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{selectedVehicle.driverName}</p>
                            <p className="text-[10px] text-slate-400">{selectedVehicle.driverRole}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => alert(`Showing log history for driver ${selectedVehicle.driverName}`)}
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          View Driver
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          const msg = prompt(`Send operational command message to ${selectedVehicle.driverName}:`);
                          if (msg) alert(`Message sent: "${msg}"`);
                        }}
                        className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                        Message
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
            <div className="glass-panel p-1.5 rounded-2xl flex flex-col gap-1 floating-ui">
              <button
                onClick={() => setSatelliteView(true)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${satelliteView ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-transparent hover:bg-slate-50 text-slate-500"}`}
                title="Satellite View"
              >
                <span className="material-symbols-outlined text-[20px]">satellite_alt</span>
              </button>
              <button
                onClick={() => setSatelliteView(false)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${!satelliteView ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-transparent hover:bg-slate-50 text-slate-500"}`}
                title="Vector Layer"
              >
                <span className="material-symbols-outlined text-[20px]">layers</span>
              </button>
            </div>
            
            <div className="glass-panel p-1 rounded-2xl flex flex-col gap-1 floating-ui">
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
              <div className="text-[9px] font-bold font-mono text-center text-slate-400 select-none py-0.5 border-y border-slate-100 my-0.5 font-outfit">
                {zoomLevel}x
              </div>
              <button
                onClick={handleZoomOut}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
            </div>

            <div className="glass-panel p-1 rounded-2xl flex flex-col gap-1 floating-ui">
              <button
                onClick={() => alert("Simulating route playback timeline...")}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
                title="Playback"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
              </button>
              <button
                onClick={handleRecenter}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
                title="Recenter Map"
              >
                <span className="material-symbols-outlined text-[20px]">my_location</span>
              </button>
              <button
                onClick={() => alert("Map lock status updated.")}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
                title="Lock Map Orientation"
              >
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </button>
            </div>
          </div>

          {/* Bottom KPI Overlay */}
          {/* Location Re-center Floating button */}
          <button
            onClick={handleRecenter}
            className="absolute bottom-10 right-6 glass-panel w-12 h-12 rounded-full flex items-center justify-center floating-ui text-primary hover:scale-105 transition-transform"
          >
            <span className="material-symbols-outlined text-[24px]" style={{ transform: "rotate(45deg)" }}>navigation</span>
          </button>
        </main>
      </div>

      {/* Footer */}
      <footer className="h-8 bg-white/80 border-t border-slate-100 px-container-padding flex items-center justify-between z-50 shrink-0 font-mono text-[9px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="font-bold uppercase tracking-tighter">Network: OPTIMAL</span>
          </div>
          <span className="uppercase tracking-tighter hidden sm:inline">Sync: {syncDiffSeconds}s ago</span>
        </div>
        <span className="uppercase tracking-widest text-[8.5px]">© 2026 TOUCHTRACK OPERATIONS CENTER</span>
      </footer>
      
    </div>
  );
}
