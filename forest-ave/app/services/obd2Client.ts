import { BluetoothDevice, BluetoothEventSubscription } from "react-native-bluetooth-classic";
import { AT_CMDS, ELM327_RESPONSES } from "../utils/obdiiCommands";

type PendingRequest = {
    command: string | null;
    resolve: (res: string) => void;
    reject: (error: Error) => void;
    timeoutId: ReturnType<typeof setTimeout>;
};

export class OBD2Client {
    btd: BluetoothDevice;
    readSubscription: BluetoothEventSubscription | null=null;
    private readBuffer: string; 
    private currWriteQueryReq: PendingRequest | null=null;

    constructor(btd: BluetoothDevice) {
        this.btd = btd;
        this.readBuffer = '';
        this.currWriteQueryReq = null;

        this.initOBD2Client();
    }
    
    async queryOBD2(obdCmd: string): Promise<string> {
        if(this.btd === null || !this.btd.isConnected()) {
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

        await this.btd.disconnect();
        this.readBuffer = '';
    }

    // the error handling here suggests that we unsubscribe, disconnect so that 
    // a connection can be tried again and we wont have duplicate connections
    private async initOBD2Client() {
        this.readSubscription = this.btd.onDataReceived((event) => {
            this.handleBtdBufferData(event.data);
        });

        console.log('INITIALIZING OBD2 SETTINGS....');

        console.log(`\tTurning echo off`);
        try {
            const obd2Res = await this.queryOBD2(AT_CMDS.ECHO_OFF);
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

        const timeoutId = this.currWriteQueryReq.timeoutId;

        if(data.includes('?')) {
            throw new Error(`obd2 error processing command: ${this.currWriteQueryReq.command}`);
        }

        const isMsgComplete = data.includes('>');
        if(isMsgComplete) {
            //remove the > character
            const processedData = data.replace('>', '');
            const currData = this.readBuffer + processedData;

            //clean up
            this.readBuffer = '';
            const currReqCopy = this.currWriteQueryReq;
            this.currWriteQueryReq= null;
            
            currReqCopy.resolve(currData);
        } else {
            this.readBuffer += data;
        }

        clearTimeout(timeoutId);
    }
}