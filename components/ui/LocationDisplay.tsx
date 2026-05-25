"use client";

import React from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { LocationData } from "@/lib/schema/eventTied";
import { MapPin } from "lucide-react";

interface LocationDisplayProps {
  locationData?: LocationData;
  locationText: string;
}

export default function LocationDisplay({ locationData, locationText }: LocationDisplayProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!locationData || !locationData.lat || !locationData.lng) {
    // Fallback if no rich location data is available
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium leading-relaxed">
            {locationText}
          </p>
        </div>
      </div>
    );
  }

  const position = { lat: locationData.lat, lng: locationData.lng };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium leading-relaxed">
            {locationData.formatted_address || locationText}
          </p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}${locationData.place_id ? `&query_place_id=${locationData.place_id}` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-primary hover:text-white text-sm font-bold transition-colors"
          >
            Get Directions →
          </a>
        </div>
      </div>

      {apiKey ? (
        <APIProvider apiKey={apiKey}>
          <div className="w-full h-[250px] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
            <Map
              defaultZoom={15}
              defaultCenter={position}
              mapId="PUBLIC_VIEW_MAP_ID"
              disableDefaultUI={true}
              zoomControl={true}
              gestureHandling="cooperative"
            >
              <AdvancedMarker position={position} />
            </Map>
          </div>
        </APIProvider>
      ) : (
        <div className="w-full h-[250px] rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/40 text-sm">
          Map temporarily unavailable.
        </div>
      )}
    </div>
  );
}
