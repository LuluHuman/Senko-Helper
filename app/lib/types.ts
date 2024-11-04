export interface busStop {
    BusStopCode: string;
    RoadName: string;
    Description: string;
    Latitude: number;
    Longitude: number;
}

export interface nextBus {
    OriginCode: string; // Reference code of the first bus stop where this bus started its service
    DestinationCode: string; // Reference code of the last bus stop where this bus will terminate its service
    EstimatedArrival: string; // Date-time of this bus’ estimated time of arrival,expressed in the UTC standard, GMT+8 forSingapore Standard Time (SST)
    // Current estimated location coordinates of this bus at point of published data
    Latitude: number;
    Longitude: number;

    VisitNumber: "1" | "2" | ""; // Ordinal value of the nth visit of this vehicle at this bus stop; 1=1st visit, 2=2nd visit
    Load: "SEA" | "SDA" | "LSD" | ""; // Current bus occupancy / crowding level
    Feature: "WAB" | ""; // Indicates if bus is wheel-chair accessible
    Type: "SD" | "DD" | "BD" | ""; // Vehicle type
}
export type services =
    | {
        ServiceNo: string; // Bus service number
        Operator: "SBST" | "SMRT" | "TTS" | "GAS" | ""; //Public Transport Operator Code [Full refrence, go to docs]

        //Structural tags for all bus level attributes of the next 3 oncoming buses.
        NextBus: nextBus;
        NextBus2: nextBus;
        NextBus3: nextBus;
    }[]
    | [];

export interface MUISPrayerTime {
    "PrayerDate": string,
    "Hijri": string,
    "Subuh": string,
    "Syuruk": string,
    "Zohor": string,
    "Asar": string,
    "Maghrib": string,
    "Isyak": string,
}