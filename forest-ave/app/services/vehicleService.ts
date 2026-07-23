import { OBD2Client } from "./obd2Client";

export class VehicleService {
    obd2Client: OBD2Client;

    constructor(client: OBD2Client) {
        this.obd2Client = client;
    }
}