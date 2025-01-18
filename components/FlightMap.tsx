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

// Define a D3 projection to convert lat/lon to x/y
const projection = geoEqualEarth().scale(160).translate([400, 250]);

export default function FlightMap({ flightData }: FlightMapProps) {
  return (
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
                fill="#1f2937"
                stroke="#374151"
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
  );
}
