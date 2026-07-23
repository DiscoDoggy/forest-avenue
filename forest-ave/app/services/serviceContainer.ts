import { GpsService } from "./gpsService";
import { MpgGpsAggregator } from "./mpgGpsAggregator";
import { MpgPollingService } from "./mpgPollingService";
import { OBD2Client } from "./obd2Client";
import { TripRecorder } from "./tripRecorder";
import { VehicleService } from "./vehicleService";

// initialize all services
export const obd2Client = new OBD2Client();
const vehicleService = new VehicleService(obd2Client);

const mpgGpsStatsAggregator = new MpgGpsAggregator(); 

const mpgPoller = new MpgPollingService(obd2Client, mpgGpsStatsAggregator);
const gpsPoller = new GpsService(mpgGpsStatsAggregator);

export const tripRecorder = new TripRecorder(mpgPoller, gpsPoller, vehicleService, mpgGpsStatsAggregator);