import { Aircraft } from "../../shared/models/aircraft";
import { Flight, initialFlight } from "../../shared/models/flight";

export type FlightEditVm = {
    flight: Flight;
    aircrafts: Array<Aircraft>;
}

export const  initialFlightEditVm = {
    flight: initialFlight,
    aircrafts: []
}
