import { BluetoothDevice } from "react-native-bluetooth-classic";
import { MpgPollingService } from "./mpgPollingService";
import { OBD2Client } from "./obd2Client";

export class VehicleService {
    obd2Client: OBD2Client | null;
    mpgPollingService: MpgPollingService | null;

    constructor() {
        this.obd2Client = null;
        this.mpgPollingService = null;
    }

    async connect(btd: BluetoothDevice) {
        // so on the application level, the user has a list of potential bonded devices
        // when they select one of those bonded devices HERE we attempt to connect to it
        const isConnected = await btd.isConnected(); 
        if(isConnected) { //device is already connected. Do we want to throw an error that gets handled at the app level? 
            return;
        } 

        const connection = await btd.connect({delimiter: '>'});
        if(!connection) {
            throw new Error(`attempted to connect to ${btd.name} but could not establish a connection`);
        }

        this.obd2Client = new OBD2Client(btd);
        this.mpgPollingService = new MpgPollingService(this.obd2Client);
    }

    async disconnect() {
        if(!this.obd2Client || !this.obd2Client.btd.isConnected()) {
            return;    
        }

        this.obd2Client.removeBtdConnection();
    }
}

export const vehicleService = new VehicleService();