import { apply, applyWhenValue, maxLength, min, required, schema } from "@angular/forms/signals";

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

export const flightConnectionSchema = schema<FlightConnection>(flightConnection => {
    required(flightConnection.from);
    required(flightConnection.to);
    maxLength(flightConnection.icaoFrom, 4);
    maxLength(flightConnection.icaoTo, 4);
});

export type FlightTimes = {
    takeOff: string;
    landing: string;
};

export const initialFlightTimes: FlightTimes = {
    takeOff: '',
    landing: ''
};

export const flightTimesSchema = schema<FlightTimes>(flightTimes => {
    required(flightTimes.takeOff);
    required(flightTimes.landing);
});

export type FlightOperator = {
    name: string;
    shortName: string;
    aircraftId: string;
};

export const initialFlightOperator: FlightOperator = {
    name: '',
    shortName: '',
    aircraftId: ''
};

export const flightOperatorSchema = schema<FlightOperator>(flightOperator => {
    required(flightOperator.name);
    required(flightOperator.shortName);
});

export type FlightPrice = {
    basePrice: number;
    seatReservationSurcharge: number;
};

export const initialFlightPrice: FlightPrice = {
    basePrice: 0,
    seatReservationSurcharge: 0
};

export const flightPriceSchema = schema<FlightPrice>(flightPrice => {
    min(flightPrice.basePrice, 0);
    min(flightPrice.seatReservationSurcharge, 0);
});

export type Flight = {
    id: number;
    connection: FlightConnection;
    times: FlightTimes;
    operator: FlightOperator;
    price: FlightPrice | null;
};

export const initialFlight: Flight = {
    id: 0,
    connection: initialFlightConnection,
    times: initialFlightTimes,
    operator: initialFlightOperator,
    price: null
};

export const flightSchema = schema<Flight>(flight => {
    apply(flight.connection, flightConnectionSchema);
    apply(flight.times, flightTimesSchema);
    apply(flight.operator, flightOperatorSchema);
    applyWhenValue(flight.price, price => price !== null, flightPriceSchema);
});
