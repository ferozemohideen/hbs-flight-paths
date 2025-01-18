import FlightMap from "@/components/FlightMap";
import { getAllTrips } from "@/lib/sheets";

// Add this export to disable caching
export const dynamic = "force-dynamic";
// Or alternatively:
// export const revalidate = 0;

export default async function Home() {
  const trips = await getAllTrips();

  return (
    <main>
      <FlightMap flightData={trips} />
    </main>
  );
}
