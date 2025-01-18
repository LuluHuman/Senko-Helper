export type weekList = {
    [day in "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday"]: {
        [time: string]: string | null;
    };
};

export interface dayList {
    [key: string]: string | string[] | null;
}
export interface crowdedness {
    Recess: {
        [key: string]: {
            [key: string]: string[]
        }
    },
    Break: {
        [key: string]: {
            [key: string]: string[]
        }
    },
}

export interface TrackType {
    settings: {
        class: {
            level: number;
            class: number;
        };
        Elec: {
            Sci: string;
        };
    },
    dayList: dayList;
    active?: number;
    day?: keyof weekList
    isOdd: boolean;
}

// 
export interface CircularProgressType {
    valuePercentage?: number;
    text: {
        title: string,
        subtitle: string,
        timeRemaining: string
    }
}

export interface ClientType {
    isOdd: boolean;
    simple?: boolean;
    config?: any
}

export interface state {
    state: string;
    error: null | string;
}
export interface busStop {
    BusStopCode: string;
    RoadName: string;
    Description: string;
    Latitude: number;
    Longitude: number;
}

//full docs https://datamall.lta.gov.sg/content/dam/datamall/datasets/LTA_DataMall_API_User_Guide.pdf
export type services = {
    ServiceNo: string; // Bus service number
    Operator: "SBST" | "SMRT" | "TTS" | "GAS" | ""; //Public Transport Operator Code [Full refrence, go to docs]

    //Structural tags for all bus level attributes of the next 3 oncoming buses.
    NextBus: nextBus;
    NextBus2: nextBus;
    NextBus3: nextBus;
}[] | [];

export interface nextBus {
    OriginCode: string; // Reference code of the first bus stop where this bus started its service
    DestinationCode: string; // Reference code of the last bus stop where this bus will terminate its service
    EstimatedArrival: string; // Date-time of this bus’ estimated time of arrival,expressed in the UTC standard, GMT+8 forSingapore Standard Time (SST)
    // Current estimated location coordinates of this bus at point of published data
    Latitude: string;
    Longitude: string;

    VisitNumber: "1" | "2" | ""; // Ordinal value of the nth visit of this vehicle at this bus stop; 1=1st visit, 2=2nd visit
    Load: "SEA" | "SDA" | "LSD" | ""; // Current bus occupancy / crowding level
    Feature: "WAB" | ""; // Indicates if bus is wheel-chair accessible
    Type: "SD" | "DD" | "BD" | ""; // Vehicle type
}