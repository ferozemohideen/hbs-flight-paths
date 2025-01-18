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
    setLocations([...locations, location]);
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
    e.preventDefault();

    if (locations.length < 2) {
      alert("Please add at least two locations");
      return;
    }

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ route: locations }),
      });

      if (!response.ok) throw new Error("Failed to save trip");

      router.push("/");
    } catch (error) {
      console.error("Failed to save trip:", error);
      alert("Failed to save trip. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#a41034] p-8">
      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Add New Trip</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-white text-sm font-medium mb-2">
              Add Locations
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
            className="w-full bg-white text-[#a41034] py-2 px-4 rounded-md font-medium hover:bg-white/90 transition-colors"
            disabled={locations.length < 2}
          >
            Save Trip
          </button>
        </form>
      </div>
    </div>
  );
}
