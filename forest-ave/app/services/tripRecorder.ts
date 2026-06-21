import { GpsService } from "./gpsService";
import { MpgGpsAggregator } from "./mpgGpsAggregator";
import { MpgPollingService } from "./mpgPollingService";
import { VehicleService } from "./vehicleService";

type preliminaryTripInfo = {
    tripId: string,
    tripName?: string
};

export class TripRecorder {
    basicTripInfo?: preliminaryTripInfo;

    mpgRecorder: MpgPollingService;
    gpsRecorder: GpsService;
    tripVehicleService: VehicleService;
    tripStatsAggregator: MpgGpsAggregator;

    constructor(mpgRecorder:MpgPollingService, gpsRecorder: GpsService, tripVehicleService: VehicleService, mpgGpsAggregator: MpgGpsAggregator) {
        this.mpgRecorder = mpgRecorder;
        this.gpsRecorder = gpsRecorder;
        this.tripVehicleService = tripVehicleService;
        this.tripStatsAggregator = mpgGpsAggregator;
    }

    startTrip() {
        this.mpgRecorder.startMPGPolling();
        this.gpsRecorder.connect();

        if(!this.basicTripInfo) {
            this.basicTripInfo = {
                tripId: crypto.randomUUID()
            }
            if(!this.tripStatsAggregator.tripId){
                this.tripStatsAggregator.tripId = this.basicTripInfo.tripId;
            }
        }
    }

    pauseTrip() {
        this.mpgRecorder.stopMPGPolling();
        this.gpsRecorder.disconnect();
    }

    async endTrip() {
        this.pauseTrip();
        //then flush rest of stuff
        await this.tripStatsAggregator.flushToPermStorage();
        this.tripStatsAggregator.clearData();
    }

    setTripName() {
        return;
    }


}