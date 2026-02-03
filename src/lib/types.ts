export interface LiveQueue {
    STANDBY?: {
        waitTime: number;
    };
    PAID_RETURN_TIME?: {
        state: string;
        returnStart?: string;
        returnEnd?: string;
        price?: {
            amount: number;
            currency: string;
            formatted: string;
        };
    };
    BOARDING_GROUP?: {
        allocationStatus: string;
        estimatedWait?: number;
    };
}

export interface Forecast {
    time: string;
    waitTime: number;
    percentage: number;
}

export interface LiveStatus {
    id: string;
    name: string;
    entityType: string;
    status: "OPERATING" | "DOWN" | "CLOSED" | "REFURBISHMENT";
    lastUpdated: string;
    queue?: LiveQueue;
    forecast?: Forecast[];
}

export interface ParkLiveData {
    id: string;
    name: string;
    liveData: LiveStatus[];
}

export interface WaitTimeSnapshot {
    timestamp: string;
    parks: ParkLiveData[];
}
