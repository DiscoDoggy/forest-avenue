import { BluetoothDevice, BluetoothEventSubscription } from "react-native-bluetooth-classic";
import { AT_CMDS, ELM327_RESPONSES } from "../utils/obdiiCommands";

type PendingRequest = {
    command: string | null;
    resolve: (res: string) => void;
    reject: (error: Error) => void;
    timeoutId: ReturnType<typeof setTimeout>;
};

export class OBD2Client {
    btd?: BluetoothDevice;
    readSubscription: BluetoothEventSubscription | null=null;
    private readBuffer: string; 
    private currWriteQueryReq: PendingRequest | null=null;

    constructor() {
        this.readBuffer = '';
        this.currWriteQueryReq = null;

    }

    async connect(btd: BluetoothDevice) {
        console.log('enter obd2client connect function');
        if(this.btd) {
            await this.btd.disconnect();
        }
        if(this.readSubscription) {
            this.readSubscription.remove();
        }
        this.readBuffer = '';

        this.btd = btd;
        
        const isConnected = await btd.isConnected(); 
        console.log('isConnected runs');
        if(isConnected) { //device is already connected. Do we want to throw an error that gets handled at the app level? 
            console.log('device already connected');
            return;
        }

        const connection = await btd.connect({delimiter: '>', secureSocket: false});
        console.log('.connect runs')
        if(!connection) { //ideally we retry
            throw new Error(`attempted to connect to ${btd.name} but could not establish a connection`);
        }
        console.log('before init');
        await this.initOBD2Client();
        console.log('after init')
    }

    async disconnect() {
        if(!this.btd || !this.btd.isConnected()) {
            return;    
        }

        this.removeBtdConnection(); 
    }
    
    async queryOBD2(obdCmd: string): Promise<string> {
        if(!this.btd || !(await this.btd.isConnected())) {
            throw new Error(`attempted to query obd2 but no bluetooth device connected`);
        }

        //request already existing
        if(this.currWriteQueryReq) {
            return Promise.reject(
                new Error(`multiple requests cannot be issued simulatenosuly. still witing for ${obdCmd}`)
            );
        }

        const bufferResponsePromise = new Promise<string>((resolve, reject) => {

            const timeoutId = setTimeout(()=> {
                this.readBuffer = '';
                this.currWriteQueryReq = null;

                reject(new Error(`timeout occured while waiting for response for command ${obdCmd}`));

            }, 1000);

            this.currWriteQueryReq = {
                command: obdCmd,
                resolve: resolve,
                reject: reject,
                timeoutId: timeoutId
            };

        });

        const isMsgSendSuccess = await this.btd.write(`${obdCmd}\r`);
        if(!isMsgSendSuccess) {
            throw new Error(`sending command to connected obd2 device ${this.btd.name} failed`);
        }

        return bufferResponsePromise;
    }

    async removeBtdConnection() {
        if(this.readSubscription) {
            this.readSubscription.remove();
        }

        this.readBuffer = '';

        if(!this.btd) {
            return;
        }

        await this.btd.disconnect();
    }

    // the error handling here suggests that we unsubscribe, disconnect so that 
    // a connection can be tried again and we wont have duplicate connections
    private async initOBD2Client() {
        console.log('during init');
        if(!this.btd) {
            throw new Error('while initializing obd2Client, could not detect btd');
        }
        this.readSubscription = this.btd.onDataReceived((event) => {
            this.handleBtdBufferData(event.data);
        });

        console.log('INITIALIZING OBD2 SETTINGS....');

        console.log(`\tTurning echo off`);
        try {
            const obd2Res = await this.queryOBD2(AT_CMDS.ECHO_OFF);
            console.log(`ascii numbers of obd2res: ${obd2Res.charCodeAt(0)}, size of response: ${obd2Res.length}`);
            if(obd2Res !== ELM327_RESPONSES.AT_CMD_SUCCESS) {
                throw new Error(`AT command unsuccessful: got ${obd2Res}`);
            }
        } catch(error) {
            this.removeBtdConnection()
            throw error;
        }

        console.log('FINISHED INITIALIZING OBD2 SETTINGS');
    }

    // i think this function's sole responsability should be writing the response of the bluetooth to the intermediary buffer
    private handleBtdBufferData(data: string) {
        if(this.currWriteQueryReq === null) return;

        console.log(`DATA RECEIVED IN HANDLE BTD BUFFER DATA: ${data}`);

        const timeoutId = this.currWriteQueryReq.timeoutId;

        if(data.includes('?')) {
            throw new Error(`obd2 error processing command: ${this.currWriteQueryReq.command}`);
        }

        const currData = this.readBuffer + data;
        this.readBuffer = '';
        const currReqCopy = this.currWriteQueryReq;
        this.currWriteQueryReq= null;
        
        currReqCopy.resolve(currData.trim());

        clearTimeout(timeoutId);
    }
}