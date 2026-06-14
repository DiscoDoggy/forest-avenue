import { GpsService } from "./gpsService";
import { MpgGpsAggregator } from "./mpgGpsAggregator";
import { VehicleService } from "./vehicleService";

// initialize all services
export const mpgGpsAggregator = new MpgGpsAggregator(); 

export const vehicleService = new VehicleService(mpgGpsAggregator);
export const gpsService = new GpsService(mpgGpsAggregator);

