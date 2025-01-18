"use client";

import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ProjectionFunction,
} from "react-simple-maps";
import { geoEqualEarth } from "d3-geo";
import FlightPath from "./FlightPath";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";

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

function calculateLongestFlight(cities: City[]) {
  let longestDistance = 0;
  for (let i = 0; i < cities.length - 1; i++) {
    const distance = calculateDistance(
      cities[i].lat,
      cities[i].lon,
      cities[i + 1].lat,
      cities[i + 1].lon
    );
    longestDistance = Math.max(longestDistance, distance);
  }
  return longestDistance;
}

function calculateContinentsVisited(cities: City[]) {
  // Rough continent determination based on lat/lon
  const continents = new Set(
    cities.map((city) => {
      const { lat, lon } = city;
      if (lat > 34 && lon > -14 && lon < 45) return "Europe";
      if (lat > 12 && lon > 25 && lon < 145) return "Asia";
      if (lat < 12 && lat > -35 && lon > 25 && lon < 145)
        return "Southeast Asia";
      if (lat > 24 && lon > -125 && lon < -67) return "North America";
      if (lat < 24 && lat > -55 && lon > -125 && lon < -35)
        return "South America";
      if (lat < 35 && lat > -38 && lon > -18 && lon < 52) return "Africa";
      if (lat < -10 && lat > -45 && lon > 110 && lon < 180) return "Oceania";
      return "Other";
    })
  );
  return continents.size;
}

function calculateTotalFlights(routes: FlightDatum[]) {
  return routes.reduce((total, route) => total + route.route.length - 1, 0);
}

const projection = geoEqualEarth().scale(200).translate([500, 300]);

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

  const longestFlight = Math.round(calculateLongestFlight(allCities));
  const continentsVisited = calculateContinentsVisited(allCities);
  const totalFlights = calculateTotalFlights(flightData);
  const averageFlightDistance = Math.round(totalDistance / totalFlights);

  return (
    <div className="flex flex-col items-center py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          HBS Travel Winter 2024-2025
        </h1>
        <p className="text-white/80 text-lg">A journey across continents</p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex w-full max-w-[1400px] gap-8 px-8">
        {/* Left Column - Stats and Button */}
        <div className="flex flex-col gap-6 w-[300px]">
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {Math.round(totalDistance).toLocaleString()}
              </div>
              <div className="text-white/80 text-sm">Total Miles</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {longestFlight.toLocaleString()}
              </div>
              <div className="text-white/80 text-sm">Longest Flight</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {averageFlightDistance.toLocaleString()}
              </div>
              <div className="text-white/80 text-sm">Avg Flight</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {totalFlights}
              </div>
              <div className="text-white/80 text-sm">Total Flights</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {uniqueCities}
              </div>
              <div className="text-white/80 text-sm">Cities</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {continentsVisited}
              </div>
              <div className="text-white/80 text-sm">Continents</div>
            </div>
            <div className="col-span-2 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {timezoneSpan}
              </div>
              <div className="text-white/80 text-sm">Time Zones Crossed</div>
            </div>
          </div>

          {/* Add Trip Button */}
          <Link
            href="/add-trip"
            className="bg-white text-[#a41034] px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors shadow-lg text-center"
          >
            Add Your Trip
          </Link>
        </div>

        {/* Right Column - Map */}
        <div className="flex-1">
          <ComposableMap
            projection={projection as unknown as ProjectionFunction}
            style={{
              width: "100%",
              height: "auto",
              aspectRatio: "1.6 / 1",
            }}
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
      </div>
    </div>
  );
}
