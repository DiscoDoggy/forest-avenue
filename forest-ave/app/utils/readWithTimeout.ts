import { BluetoothDevice } from "react-native-bluetooth-classic";

    export async function readWithTimeout(btd: BluetoothDevice, timeoutMs: number, pollFreqMs: number): Promise<string> {
    const startTime = Date.now();

    while(Date.now() < startTime + timeoutMs) {
        if((await btd.available())) {
            let res = await btd.read();
            if(res === null) {
                throw new Error(`attempted to read from device buffer but got null: ${res}`);
            }
            
            const bufClearSuccess = await btd.clear();
            if(!bufClearSuccess) {
                throw new Error(`Failed to clear device buffer`);
            }

            return res.toString();
        }

        await new Promise<void>((resolve) => setTimeout(resolve, pollFreqMs));
    }

    throw new Error(`read timeout: no messages in ${timeoutMs}`);
}