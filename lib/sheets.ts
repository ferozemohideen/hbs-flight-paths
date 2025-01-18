import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Verify environment variables at runtime instead of module level
function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
];

async function getJWT() {
  const privateKey = getRequiredEnvVar('GOOGLE_SHEETS_PRIVATE_KEY');
  
  return new JWT({
    email: getRequiredEnvVar('GOOGLE_SHEETS_CLIENT_EMAIL'),
    key: privateKey,
    scopes: SCOPES,
  });
}

export async function getSheet() {
  const jwt = await getJWT();
  const doc = new GoogleSpreadsheet(getRequiredEnvVar('GOOGLE_SHEETS_SHEET_ID'), jwt);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0]; // Get the first sheet
  return sheet;
}

export interface TripLocation {
  name: string;
  lat: number;
  lon: number;
}

export interface Trip {
  route: TripLocation[];
}

export async function getAllTrips(): Promise<Trip[]> {
  const sheet = await getSheet();
  const rows = await sheet.getRows();
  
  const trips: Trip[] = [];
  let currentTrip: TripLocation[] = [];
  let currentTripId = '';
  
  for (const row of rows) {
    const tripId = row.get('tripId');
    const name = row.get('name');
    const lat = parseFloat(row.get('lat'));
    const lon = parseFloat(row.get('lon'));
    
    if (tripId !== currentTripId && currentTrip.length > 0) {
      trips.push({ route: [...currentTrip] });
      currentTrip = [];
    }
    
    currentTripId = tripId;
    currentTrip.push({ name, lat, lon });
  }
  
  if (currentTrip.length > 0) {
    trips.push({ route: currentTrip });
  }
  
  return trips;
}

export async function addTrip(route: TripLocation[]) {
  const sheet = await getSheet();
  const tripId = Date.now().toString(); // Use timestamp as trip ID
  
  const rows = route.map(location => ({
    tripId,
    name: location.name,
    lat: location.lat.toString(),
    lon: location.lon.toString(),
  }));
  
  await sheet.addRows(rows);
} 