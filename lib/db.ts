import AsyncStorage from "@react-native-async-storage/async-storage";
import { busStop } from "@/lib/types";
export async function getData(store: string) {
    try {
        const value = await AsyncStorage.getItem(store);
        return (value !== null ? JSON.parse(value) : [])
    } catch (e) {
        alert("Error fetching bus stops: " + e);
    }
};

export async function appendData(store: string, busStop: busStop) {
    try {
        const savedBusStops = (await getData(store)) || [];
        savedBusStops.push(busStop);
        await AsyncStorage.setItem(store, JSON.stringify(savedBusStops));
    } catch (e) {
        console.error(e);
        alert("Error saving bus stops: " + e);
    }
};

export async function removeData(store: string, busStop: busStop) {
    try {
        const savedBusStops = (await getData(store)) || []
        const index = savedBusStops.findIndex(
            (busStopf: busStop) => busStopf.BusStopCode == busStop.BusStopCode
        );
        if (index > -1) savedBusStops.splice(index, 1);
        await AsyncStorage.setItem(store, JSON.stringify(savedBusStops));
    } catch (e) {
        console.error(e);
        alert("Error saving bus stops: " + e);
    }
};