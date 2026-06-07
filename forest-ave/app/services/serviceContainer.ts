import { GpsService } from "./gpsService";
import { MpgGpsAggregator } from "./mpgGpsAggregator";
import { VehicleService } from "./vehicleService";

// initialize all services
export const vehicleService = new VehicleService();
export const gpsService = new GpsService();
export const mpgGpsAggregator = new MpgGpsAggregator(); 

