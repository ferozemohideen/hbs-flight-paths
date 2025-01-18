import FlightMap from "@/components/FlightMap";
import { getAllTrips } from "@/lib/sheets";

export default async function Home() {
  const trips = await getAllTrips();

  return (
    <main>
      <FlightMap flightData={trips} />
    </main>
  );
}
