import { hexResToPID } from "@/app/utils/obdiiCommands";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { BluetoothDevice } from "react-native-bluetooth-classic";

class BtdReadChannel {
    data: string | number | null;

    constructor() {
        this.data = null;
    }

    async readWithTimeout() {
        const TIMEOUT = 1500;
        const POLL_FREQ = 200;

        const startTime = Date.now();

        while(Date.now() < startTime + TIMEOUT) {
            if(this.data !== null) {
                const out = this.data;
                this.clearBuffer();
                return out;
            }

            await new Promise<void>((resolve) => setTimeout(resolve, POLL_FREQ));
        }

        throw new Error(`btd read channel error: no messages found in ${TIMEOUT} ms`);
    }

    writeChannel(data: string | number | null) {
        this.data = data;
    }

    clearBuffer() {
        this.data = null;
    }


}

interface BluetoothContextType {
    connectedDevice: BluetoothDevice | null;
    setConnectedDevice: (device: BluetoothDevice | null) => void;
    readChannel: BtdReadChannel;
    btdReceivedData: string | number | null;
}

export const BluetoothDeviceContext = createContext<BluetoothContextType | null>(null);

export const BluetoothDeviceContextProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
    const [btdReceivedData, setBtdReceivedData] = useState<string | number | null>('no data received');
    const readChannel = useRef(new BtdReadChannel());

    useEffect(() => {
        let subscription: any;
        if(connectedDevice === null) {
            console.log(`no device connected`);
        }

        if(connectedDevice) {
            console.log(`creating read subscription with ${connectedDevice.name}`);
            subscription = connectedDevice.onDataReceived((event) => {

                let modeAndPin= event.data.split(' ').slice(0, 2).join(" ");
                console.log(`mode and pin parsed: ${modeAndPin}`);

                if(!(modeAndPin in hexResToPID)) {
                    console.error(`OBD command Key error: no valid OBD data returned. Got: ${event.data}`);
                    setBtdReceivedData(event.data);
                    readChannel.current.writeChannel(event.data);
                } else {
                    const hexPidType = hexResToPID[modeAndPin];
                    const processedValue = hexPidType.processor(event.data);
                    console.log(`successfully received response from OBD2: ${event.data}, processed: ${processedValue}`);
                    setBtdReceivedData(processedValue);
                    readChannel.current.writeChannel(processedValue);
                }
            });
        }

        return () => {
            if(subscription && connectedDevice) {
                console.log(`unsubscribing ${connectedDevice.name} from receiving data events`);
                subscription.remove();
            }
        }

    }, [connectedDevice]);

    return (
        <BluetoothDeviceContext.Provider value={{connectedDevice, setConnectedDevice, btdReceivedData, readChannel: readChannel.current}}>
            {children}
        </BluetoothDeviceContext.Provider>
    )
}

export const useBluetooth = () => {
    const context = useContext(BluetoothDeviceContext);
    if(!context) {
        throw new Error("useBluetooth must be used within bluetooth provider");
    }

    return context

}