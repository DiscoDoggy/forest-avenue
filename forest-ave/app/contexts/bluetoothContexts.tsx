import { hexResToPID } from "@/constants/obdiiCommands";
import { createContext, useContext, useEffect, useState } from "react";
import { BluetoothDevice } from "react-native-bluetooth-classic";

interface BluetoothContextType {
    connectedDevice: BluetoothDevice | null;
    setConnectedDevice: (device: BluetoothDevice | null) => void;
    btdReceivedData: string | number;
}

export const BluetoothDeviceContext = createContext<BluetoothContextType | null>(null);

export const BluetoothDeviceContextProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
    const [btdReceivedData, setBtdReceivedData] = useState<string | number>('no data yet');

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
                } else {
                    const hexPidType = hexResToPID[modeAndPin];
                    const processedValue = hexPidType.processor(event.data);
                    console.log(`successfully received response from OBD2: ${event.data}, processed: ${processedValue}`);
                    setBtdReceivedData(processedValue);
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
        <BluetoothDeviceContext.Provider value={{connectedDevice, setConnectedDevice, btdReceivedData}}>
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