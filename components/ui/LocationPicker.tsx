"use client";

import React, { useEffect, useState, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, useMapsLibrary, useMap } from "@vis.gl/react-google-maps";
import { LocationData } from "@/lib/schema/eventTied";

interface LocationPickerProps {
  locationData?: LocationData;
  initialLocation?: string;
  onChange: (location: string, locationData: LocationData) => void;
  error?: string;
}

const NIGERIA_CENTER = { lat: 9.082, lng: 8.6753 }; // Default center for map

const PlacesAutocomplete = ({
  onPlaceSelect,
  initialValue,
  error,
  country,
}: {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  initialValue?: string;
  error?: string;
  country?: string;
}) => {
  const [inputValue, setInputValue] = useState(initialValue || "");
  const places = useMapsLibrary("places");
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options: google.maps.places.AutocompleteOptions = {
      fields: ["geometry", "name", "formatted_address", "place_id"],
    };

    if (country) {
      const countryCodeMap: Record<string, string> = {
        "Nigeria": "ng",
        "United States": "us",
        "United Kingdom": "gb",
      };
      const code = countryCodeMap[country] || "ng";
      options.componentRestrictions = { country: code };
    }

    setAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places, country]);

  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      setInputValue(place.formatted_address || place.name || "");
      onPlaceSelect(place);
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [autocomplete, onPlaceSelect]);

  useEffect(() => {
    if (initialValue && initialValue !== inputValue) {
        setInputValue(initialValue);
    }
  }, [initialValue]);

  return (
    <div>
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 font-medium text-sm outline-none transition-all duration-200 bg-white/5 border border-white/10 focus:border-orange-500/70 focus:bg-white/8 focus:ring-2 focus:ring-orange-500/20"
        placeholder="Search for venue or address..."
      />
      {error && (
        <p className="text-orange-400 text-xs mt-1.5 font-medium">{error}</p>
      )}
    </div>
  );
};

const MapHandler = ({ place, markerPos }: { place: google.maps.places.PlaceResult | null, markerPos: google.maps.LatLngLiteral | null }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !place || !place.geometry?.location) return;
    map.panTo(place.geometry.location);
    map.setZoom(15);
  }, [map, place]);

  useEffect(() => {
      if(!map || !markerPos) return;
      map.panTo(markerPos);
  }, [map, markerPos]);

  return null;
};

export default function LocationPicker({ locationData, initialLocation, onChange, error, country }: LocationPickerProps & { country?: string }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(
    locationData ? { lat: locationData.lat, lng: locationData.lng } : null
  );
  const [localError, setLocalError] = useState<string | null>(null);

  const handlePlaceSelect = (place: google.maps.places.PlaceResult | null) => {
    setSelectedPlace(place);
    if (place?.geometry?.location) {
      setLocalError(null);
      const newPos = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setMarkerPosition(newPos);
      onChange(place.formatted_address || place.name || "", {
        formatted_address: place.formatted_address || place.name || "",
        lat: newPos.lat,
        lng: newPos.lng,
        place_id: place.place_id,
      });
    } else {
      setLocalError("Location not found. Please select a valid location from the suggestions.");
    }
  };

  const updateLocationFromLatLng = (newPos: google.maps.LatLngLiteral) => {
    setMarkerPosition(newPos);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: newPos }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        onChange(results[0].formatted_address, {
          formatted_address: results[0].formatted_address,
          lat: newPos.lat,
          lng: newPos.lng,
          place_id: results[0].place_id,
        });
      } else {
        onChange(`Lat: ${newPos.lat.toFixed(4)}, Lng: ${newPos.lng.toFixed(4)}`, {
          formatted_address: `Lat: ${newPos.lat.toFixed(4)}, Lng: ${newPos.lng.toFixed(4)}`,
          lat: newPos.lat,
          lng: newPos.lng,
        });
      }
    });
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    updateLocationFromLatLng(newPos);
  };

  const handleMapClick = (e: any) => {
    if (!e.detail || !e.detail.latLng) return;
    const newPos = { 
      lat: typeof e.detail.latLng.lat === 'function' ? e.detail.latLng.lat() : e.detail.latLng.lat, 
      lng: typeof e.detail.latLng.lng === 'function' ? e.detail.latLng.lng() : e.detail.latLng.lng 
    };
    updateLocationFromLatLng(newPos);
  };

  if (!apiKey) {
    return (
      <div className="p-4 bg-white/5 border border-orange-500/30 rounded-xl">
        <p className="text-orange-300 text-sm">
          Google Maps API key is missing. Please add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="space-y-4">
        <PlacesAutocomplete 
            onPlaceSelect={handlePlaceSelect} 
            initialValue={initialLocation || locationData?.formatted_address}
            error={localError || error} 
            country={country}
        />
        
        <div className="w-full h-[300px] rounded-xl overflow-hidden border border-white/10">
          <Map
            defaultZoom={markerPosition ? 15 : 6}
            defaultCenter={markerPosition || NIGERIA_CENTER}
            mapId="DEMO_MAP_ID"
            disableDefaultUI={true}
            zoomControl={true}
            onClick={handleMapClick}
          >
            {markerPosition && (
              <AdvancedMarker
                position={markerPosition}
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
              />
            )}
            <MapHandler place={selectedPlace} markerPos={markerPosition} />
          </Map>
        </div>
      </div>
    </APIProvider>
  );
}
