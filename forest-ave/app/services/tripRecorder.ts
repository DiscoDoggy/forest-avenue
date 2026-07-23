import { GpsService } from "./gpsService";
import { MpgGpsAggregator } from "./mpgGpsAggregator";
import { MpgPollingService } from "./mpgPollingService";
import { VehicleService } from "./vehicleService";
import uuid from 'react-native-uuid';

export class TripRecorder {
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

        if(!this.tripStatsAggregator.tripInfo) {
            this.tripStatsAggregator.tripInfo = {
                tripId: uuid.v4(), 
                tripStartTime: Date.now()
            }
        }
    }

    pauseTrip() {
        this.mpgRecorder.stopMPGPolling();
        this.gpsRecorder.disconnect();
    }

    async endTrip() {
        this.pauseTrip();
        if(!this.tripStatsAggregator.tripInfo) {
            throw new Error('Tried to end trip but no active trip information found');
        }

        this.tripStatsAggregator.tripInfo.tripEndTime = Date.now();
        await this.tripStatsAggregator.flushToPermStorage();
        this.tripStatsAggregator.clearData();
    }

    setTripName(tripName: string) {
        if(!this.tripStatsAggregator.tripInfo) {
            throw new Error('Tried to set trip name but no active trip exists');
        }
        
        //TODO ADD VALIDATION WITH DIFFERNT INPUT ERROR TYPES TO BE DISPALYED ON FRONTEND
        const newTripName = tripName.trim();
        this.tripStatsAggregator.tripInfo.tripName = newTripName;
    }
}