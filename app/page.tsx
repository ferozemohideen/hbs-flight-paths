"use client";

import FlightMap from "@/components/FlightMap";

export default function Home() {
  // Example flight data: each route is an array of cities, each with lat/lon
  const flightData = [
    {
      route: [
        { name: "Boston", lat: 42.3601, lon: -71.0589, country: "USA" },
        { name: "New York", lat: 40.7128, lon: -74.006, country: "USA" },
        { name: "London", lat: 51.5074, lon: -0.1278, country: "UK" },
      ],
    },
    {
      route: [
        { name: "Boston", lat: 42.3601, lon: -71.0589, country: "USA" },
        { name: "Dubai", lat: 25.2048, lon: 55.2708, country: "UAE" },
        { name: "Tokyo", lat: 35.6762, lon: 139.6503, country: "Japan" },
      ],
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#1a0b3b]">
      <FlightMap flightData={flightData} />
    </main>
  );
}
