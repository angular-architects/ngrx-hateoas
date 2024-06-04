export type HomeVm = {
    flightManagementSummary: {
        flightCount: number,
        passengerCount: number,
        averagePassengerCountPerFlight: number
    },
    flightShoppingSummary: {
        maxBasePrice: number,
        minBasePrice: number,
        averagePrice: number
    }
}

export const initialHomeVm: HomeVm = {
    flightManagementSummary: {
        flightCount: 0,
        passengerCount: 0,
        averagePassengerCountPerFlight: 0,
    },
    flightShoppingSummary: {
        maxBasePrice: 0,
        minBasePrice: 0,
        averagePrice: 0
    }
}
