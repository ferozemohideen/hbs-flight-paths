"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableLocation } from "@/components/SortableLocation";

interface Location {
  name: string;
  lat: number;
  lon: number;
}

export default function AddTrip() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addLocation = (location: Location) => {
    console.log("Adding location:", location);
    setLocations((prev) => {
      const newLocations = [...prev, location];
      console.log("New locations array:", newLocations);
      return newLocations;
    });
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLocations((items) => {
        const oldIndex = items.findIndex(
          (item) => `${item.name}-${item.lat}-${item.lon}` === active.id
        );
        const newIndex = items.findIndex(
          (item) => `${item.name}-${item.lat}-${item.lon}` === over.id
        );
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Form submission started");
    e.preventDefault();

    if (locations.length < 1) {
      alert("Please add at least one destination");
      return;
    }

    try {
      console.log("Submitting trip:", locations);

      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ route: locations }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save trip");
      }

      const data = await response.json();
      console.log("Response:", data);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to save trip:", error);
      alert(
        `Failed to save trip: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#a41034] p-8">
      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Add New Trip</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-white text-sm font-medium mb-2">
              Add Destination
            </label>
            <PlacesAutocomplete onSelect={addLocation} />
          </div>

          {/* Display selected locations */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={locations.map(
                (loc) => `${loc.name}-${loc.lat}-${loc.lon}`
              )}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {locations.map((location, index) => (
                  <SortableLocation
                    key={`${location.name}-${location.lat}-${location.lon}`}
                    id={`${location.name}-${location.lat}-${location.lon}`}
                    location={location}
                    onRemove={() => removeLocation(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            type="submit"
            className="w-full bg-white text-[#a41034] py-2 px-4 rounded-md font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={locations.length < 1}
            onClick={() => console.log("Button clicked", locations.length)}
          >
            Save Trip
          </button>
        </form>
      </div>
    </div>
  );
}
