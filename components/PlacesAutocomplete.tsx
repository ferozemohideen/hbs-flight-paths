"use client";

import { useEffect, useRef, useState } from "react";

interface PlacesAutocompleteProps {
  onSelect: (location: { name: string; lat: number; lon: number }) => void;
}

export default function PlacesAutocomplete({
  onSelect,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!inputRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["(cities)"],
      }
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();

      if (place?.geometry?.location) {
        onSelect({
          name: place.name || "",
          lat: place.geometry.location.lat(),
          lon: place.geometry.location.lng(),
        });
        setInputValue("");
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onSelect]);

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    console.log("Selected place:", place);

    if (place.geometry?.location) {
      const location = {
        name: place.name || "",
        lat: place.geometry.location.lat(),
        lon: place.geometry.location.lng(),
      };
      console.log("Calling onSelect with:", location);
      onSelect(location);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder="Enter a city"
      className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40"
    />
  );
}
