import { FlightConnection, initialFlightConnection } from "../../shared/models/flight"

export type FlightCreateVm = {
    template: {
        connection: FlightConnection
    }
};

export const initialFlightCreateVm: FlightCreateVm = {
    template: {
        connection: initialFlightConnection
    }
};
