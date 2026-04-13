import { BluetoothDevice } from "react-native-bluetooth-classic";

    export async function handleSendOBDCmd (btd: BluetoothDevice | null , cmd: string) {

        console.log(`attempting to send message: ${cmd} to device: ${btd?.name}`);
        if(btd === null || !btd.isConnected()) {
            console.error(`error: connection to OBDII device could not be established`);
            return;
        }
        // const finalCmd = cmd.replace(/\s+/g, '').toUpperCase();
        // const base64Data = Buffer.from(finalCmd, 'ascii').toString('base64');

        const isMsgSendSuccess = await btd.write(`${cmd}\r`);
        if(!isMsgSendSuccess) {
            console.error(`error: ${cmd} to obd2 device failed`);
            return;
        }
    }