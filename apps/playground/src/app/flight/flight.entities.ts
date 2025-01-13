
export type Aircraft = {
    id: number,
    registration: string,
    type: string
}

export const initialAircraft: Aircraft = {
    id: 0,
    registration: '',
    type: ''
}

export type FlightConnection = {
    from: string;
    to: string;
    icaoFrom: string;
    icaoTo: string;
};

export const initialFlightConnection: FlightConnection = {
    from: '',
    to: '',
    icaoFrom: '',
    icaoTo: ''
};

export type FlightTimes = {
    takeOff: string;
    landing: string;
};

export const initialFlightTimes: FlightTimes = {
    takeOff: '',
    landing: ''
};

export type FlightOperator = {
    name: string;
    shortName: string;
    aircraftId?: number;
};

export const initialFlightOperator: FlightOperator = {
    name: '',
    shortName: ''
};

export type FlightPrice = {
    basePrice: number;
    seatReservationSurcharge: number;
};

export const initialFlightPrice: FlightPrice = {
    basePrice: 0,
    seatReservationSurcharge: 0
};

export type Flight = {
    id: number;
    connection: FlightConnection;
    times: FlightTimes;
    operator: FlightOperator;
    price: FlightPrice | undefined;
};

export const initialFlight: Flight = {
    id: 0,
    connection: initialFlightConnection,
    times: initialFlightTimes,
    operator: initialFlightOperator,
    price: undefined
};
