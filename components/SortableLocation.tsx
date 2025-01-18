"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface Location {
  name: string;
  lat: number;
  lon: number;
}

interface SortableLocationProps {
  id: string;
  location: Location;
  onRemove: () => void;
}

export function SortableLocation({
  id,
  location,
  onRemove,
}: SortableLocationProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-white/5 p-3 rounded group"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-white/40 hover:text-white/60 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </button>
        <span className="text-white">{location.name}</span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-white/80 hover:text-white"
      >
        Remove
      </button>
    </div>
  );
}
