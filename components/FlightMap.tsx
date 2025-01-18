"use client";

import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoEqualEarth } from "d3-geo";
import FlightPath from "./FlightPath";
import { AnimatePresence } from "framer-motion";

interface City {
  name: string;
  lat: number;
  lon: number;
}

interface FlightDatum {
  route: City[];
}

interface FlightMapProps {
  flightData: FlightDatum[];
}

// Helper functions for statistics
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTimezoneSpan(cities: City[]) {
  const timezones = cities.map((city) => {
    // Rough timezone calculation based on longitude
    return Math.round(city.lon / 15);
  });
  const uniqueTimezones = new Set(timezones);
  return uniqueTimezones.size;
}

const projection = geoEqualEarth().scale(160).translate([400, 250]);

export default function FlightMap({ flightData }: FlightMapProps) {
  // Calculate statistics
  const allCities = flightData.flatMap((fd) => fd.route);
  const uniqueCities = new Set(allCities.map((city) => city.name)).size;

  let totalDistance = 0;
  flightData.forEach((fd) => {
    for (let i = 0; i < fd.route.length - 1; i++) {
      totalDistance += calculateDistance(
        fd.route[i].lat,
        fd.route[i].lon,
        fd.route[i + 1].lat,
        fd.route[i + 1].lon
      );
    }
  });

  const timezoneSpan = calculateTimezoneSpan(allCities);

  return (
    <div className="flex flex-col items-center space-y-8 py-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          HBS Travel Winter 2024-2025
        </h1>
        <p className="text-white/80 text-lg">A journey across continents</p>
      </div>

      {/* Map */}
      <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
        <ComposableMap
          projection={projection}
          style={{ width: "100%", height: "auto" }}
        >
          {/* SVG Filters */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* BASE MAP */}
          <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#8B0D2B"
                  stroke="#C41E3A"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* FLIGHT PATHS */}
          <AnimatePresence mode="wait">
            {flightData.map((fd, i) => (
              <FlightPath
                key={i}
                route={fd.route}
                projection={projection}
                delay={i * 0.5}
              />
            ))}
          </AnimatePresence>
        </ComposableMap>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-8 text-center max-w-3xl">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-2">
            {Math.round(totalDistance).toLocaleString()}
          </div>
          <div className="text-white/80">Miles Traveled</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-2">
            {uniqueCities}
          </div>
          <div className="text-white/80">Cities Visited</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-2">
            {timezoneSpan}
          </div>
          <div className="text-white/80">Time Zones Crossed</div>
        </div>
      </div>
    </div>
  );
}
