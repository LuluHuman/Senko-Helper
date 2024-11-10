import axios from "axios";
import { busStop, nextBus, services } from "./types";
const rurutbl_api = "https://rurutbl.luluhoy.tech/api"
export async function getNearbyBusStops({ latitude: lat, longitude: lon }: { latitude: number, longitude: number }) {
    return new Promise((res, rej) => {
        try {
            axios.get(`${rurutbl_api}/nearby-busstops`, { params: { lat, lon } }).then((response) => { res(response.data) })
        } catch (error) {
            res([])
            console.error(error);
            alert("Error fetching bus stops." + error);
        }
    }) as Promise<busStop[]>
}

export async function getBusArrival(BusStopCode: busStop["BusStopCode"]) {
    return new Promise((res, rej) => {
        try {
            axios.get(`${rurutbl_api}/bus-arrival`, { params: { BusStopCode } }).then((response) => { res(response.data) })
        } catch (error) {
            res([])
            console.error(error);
            alert("Error fetching bus arrival." + error);
        }
    }) as Promise<services>
}

export async function searchBusstops(q: string) {
    return new Promise((res, rej) => {
        try {
            axios.get(`${rurutbl_api}/search-busstops`, { params: { q } }).then((response) => { res(response.data) })
        } catch (error) {
            res(null)
            console.error(error);
            alert("Error fetching bus arrival." + error);
        }
    }) as Promise<busStop[] | null>
}