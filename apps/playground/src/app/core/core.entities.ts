
export type HomeVm = {
    flightManagementSummary: FlightManagementSummary;
    flightShoppingSummary: FlightShoppingSummary;
};

export type FlightManagementSummary = {
    flightCount: number;
    passengerCount: number;
    averagePassengerCountPerFlight: number;
};

export type FlightShoppingSummary = {
    maxBasePrice: number;
    minBasePrice: number;
    averagePrice: number;
};

export const initialHomeVm: HomeVm = {
    flightManagementSummary: {
        flightCount: 0,
        passengerCount: 0,
        averagePassengerCountPerFlight: 0
    },
    flightShoppingSummary: {
        maxBasePrice: 0,
        minBasePrice: 0,
        averagePrice: 0
    }
}
