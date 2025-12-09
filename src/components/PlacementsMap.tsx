"use client";

import { useEffect, useRef, memo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

type CityPlacement = {
  city: string;
  count: number;
  agencies?: string[];
};

type PlacementsMapProps = {
  cities: CityPlacement[];
};

// Common city coordinates (can be expanded)
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  "New York": { lat: 40.7128, lng: -74.006 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  "London": { lat: 51.5074, lng: -0.1278 },
  "Paris": { lat: 48.8566, lng: 2.3522 },
  "Milan": { lat: 45.4642, lng: 9.19 },
  "Tokyo": { lat: 35.6762, lng: 139.6503 },
  "Sydney": { lat: -33.8688, lng: 151.2093 },
  "Berlin": { lat: 52.52, lng: 13.405 },
  "Barcelona": { lat: 41.3851, lng: 2.1734 },
  "Amsterdam": { lat: 52.3676, lng: 4.9041 },
  "Toronto": { lat: 43.6532, lng: -79.3832 },
  "Vancouver": { lat: 49.2827, lng: -123.1207 },
  "Melbourne": { lat: -37.8136, lng: 144.9631 },
  "Stockholm": { lat: 59.3293, lng: 18.0686 },
  "Copenhagen": { lat: 55.6761, lng: 12.5683 },
  "Madrid": { lat: 40.4168, lng: -3.7038 },
  "Rome": { lat: 41.9028, lng: 12.4964 },
  "Dubai": { lat: 25.2048, lng: 55.2708 },
  "Singapore": { lat: 1.3521, lng: 103.8198 },
  "Hong Kong": { lat: 22.3193, lng: 114.1694 },
  "Mumbai": { lat: 19.076, lng: 72.8777 },
  "São Paulo": { lat: -23.5505, lng: -46.6333 },
  "Mexico City": { lat: 19.4326, lng: -99.1332 },
  "Buenos Aires": { lat: -34.6037, lng: -58.3816 },
  "Moscow": { lat: 55.7558, lng: 37.6173 },
  "Istanbul": { lat: 41.0082, lng: 28.9784 },
  "Seoul": { lat: 37.5665, lng: 126.978 },
  "Bangkok": { lat: 13.7563, lng: 100.5018 },
  "Jakarta": { lat: -6.2088, lng: 106.8456 },
  "Zurich": { lat: 47.3769, lng: 8.5417 },
  "Vienna": { lat: 48.2082, lng: 16.3738 },
  "Brussels": { lat: 50.8503, lng: 4.3517 },
  "Oslo": { lat: 59.9139, lng: 10.7522 },
  "Helsinki": { lat: 60.1699, lng: 24.9384 },
  "Warsaw": { lat: 52.2297, lng: 21.0122 },
  "Prague": { lat: 50.0755, lng: 14.4378 },
  "Athens": { lat: 37.9838, lng: 23.7275 },
  "Lisbon": { lat: 38.7223, lng: -9.1393 },
  "Dublin": { lat: 53.3498, lng: -6.2603 },
  "Montreal": { lat: 45.5017, lng: -73.5673 },
  "Rio de Janeiro": { lat: -22.9068, lng: -43.1729 },
  "Lima": { lat: -12.0464, lng: -77.0428 },
  "Santiago": { lat: -33.4489, lng: -70.6693 },
  "Bogotá": { lat: 4.711, lng: -74.0721 },
  "Cape Town": { lat: -33.9249, lng: 18.4241 },
  "Johannesburg": { lat: -26.2041, lng: 28.0473 },
  "Lagos": { lat: 6.5244, lng: 3.3792 },
  "Cairo": { lat: 30.0444, lng: 31.2357 },
  "Tel Aviv": { lat: 32.0853, lng: 34.7818 },
  "Beirut": { lat: 33.8938, lng: 35.5018 },
  "Manila": { lat: 14.5995, lng: 120.9842 },
  "Ho Chi Minh City": { lat: 10.8231, lng: 106.6297 },
  "Kuala Lumpur": { lat: 3.139, lng: 101.6869 },
  "Taipei": { lat: 25.033, lng: 121.5654 },
  "Shanghai": { lat: 31.2304, lng: 121.4737 },
  "Beijing": { lat: 39.9042, lng: 116.4074 },
  "Mumbai": { lat: 19.076, lng: 72.8777 },
  "Delhi": { lat: 28.6139, lng: 77.209 },
  "Bangalore": { lat: 12.9716, lng: 77.5946 },
  "Auckland": { lat: -36.8485, lng: 174.7633 },
  "Wellington": { lat: -41.2865, lng: 174.7762 },
};

function PlacementsMapComponent({ cities }: PlacementsMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map - show entire world
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 10,
        zoomControl: false,
        attributionControl: false,
        keyboard: false, // Disable keyboard navigation to prevent focus issues
      });

      // Use CartoDB Positron for minimalist style (light gray landmasses, white oceans)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Close any open popups first
    if (mapRef.current) {
      mapRef.current.closePopup();
      // Also close any popups that might be in the process of opening
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          if (layer.isPopupOpen()) {
            layer.closePopup();
          }
        }
      });
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      if (marker.isPopupOpen()) {
        marker.closePopup();
      }
      marker.remove();
    });
    markersRef.current = [];

    // Add markers for each city
    cities.forEach((cityData) => {
      // Try exact match first, then case-insensitive
      const cityKey = Object.keys(cityCoordinates).find(
        (key) => key.toLowerCase() === cityData.city.toLowerCase()
      );
      const coords = cityKey ? cityCoordinates[cityKey] : null;
      if (!coords) return;

      // Create custom green icon
      const greenIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: 10px;
          height: 10px;
          background-color: #22c55e;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        "></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      // Build popup content with agency names
      let popupContent = `<div style="text-align: left; padding: 8px; min-width: 150px;">
        <strong style="font-size: 13px; display: block; margin-bottom: 6px;">${cityData.city}</strong>`;
      
      if (cityData.agencies && cityData.agencies.length > 0) {
        // Remove duplicates and sort
        const uniqueAgencies = Array.from(new Set(cityData.agencies)).sort();
        uniqueAgencies.forEach(agency => {
          popupContent += `<div style="font-size: 11px; color: #666; margin-top: 3px; padding-left: 4px;">• ${agency}</div>`;
        });
      } else {
        popupContent += `<div style="font-size: 11px; color: #666; margin-top: 4px;">${cityData.count} ${cityData.count === 1 ? "placement" : "placements"}</div>`;
      }
      
      popupContent += `</div>`;

      const marker = L.marker([coords.lat, coords.lng], { icon: greenIcon })
        .addTo(mapRef.current!)
        .bindPopup(popupContent, { autoOpen: false });

      markersRef.current.push(marker);
    });

    // Ensure no popups are open after updating markers
    if (mapRef.current) {
      // Use setTimeout to ensure this runs after all markers are added
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.closePopup();
        }
      }, 0);
    }

    // Keep the world view - don't fit to bounds
    // The map will show the entire world by default

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [cities]);

  return (
    <div 
      ref={wrapperRef}
      className="mt-4 rounded-lg border border-[var(--border-color)] overflow-hidden bg-white"
      style={{ 
        contain: 'layout style paint',
        minHeight: '500px'
      }}
    >
      <div 
        ref={mapContainerRef} 
        className="h-[500px] w-full"
        tabIndex={-1}
      />
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const PlacementsMap = memo(PlacementsMapComponent, (prevProps, nextProps) => {
  // Only re-render if cities array actually changed
  if (prevProps.cities.length !== nextProps.cities.length) {
    return false;
  }
  
  // Deep comparison of cities
  const prevCitiesStr = JSON.stringify(prevProps.cities.map(c => ({ city: c.city, count: c.count, agencies: c.agencies?.sort() })));
  const nextCitiesStr = JSON.stringify(nextProps.cities.map(c => ({ city: c.city, count: c.count, agencies: c.agencies?.sort() })));
  
  return prevCitiesStr === nextCitiesStr;
});

