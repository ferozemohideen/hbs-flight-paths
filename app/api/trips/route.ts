import { NextResponse } from "next/server";
import { getAllTrips, addTrip } from "@/lib/sheets";

// Constants for Boston's location
const BOSTON_LOCATION = {
  name: "Boston",
  lat: 42.3601,
  lon: -71.0589,
};

export async function GET() {
  try {
    const trips = await getAllTrips();
    return NextResponse.json(trips);
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("Received POST request"); // Debug log

    const data = await request.json();
    console.log("Request data:", data); // Debug log

    // Add Boston as the starting point for every route
    const routeWithBoston = [BOSTON_LOCATION, ...data.route];
    console.log("Route with Boston:", routeWithBoston); // Debug log

    await addTrip(routeWithBoston);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save trip:", error);
    return NextResponse.json(
      { error: "Failed to save trip", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 