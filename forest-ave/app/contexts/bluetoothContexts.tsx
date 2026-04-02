import { createContext, useContext, useEffect, useState } from "react";
import { BluetoothDevice } from "react-native-bluetooth-classic";

interface BluetoothContextType {
    connectedDevice: BluetoothDevice | null;
    setConnectedDevice: (device: BluetoothDevice | null) => void;
    btdReceivedData: string;
}

export const BluetoothDeviceContext = createContext<BluetoothContextType | null>(null);

export const BluetoothDeviceContextProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
    const [btdReceivedData, setBtdReceivedData] = useState<string>('no data');

    useEffect(() => {
        let subscription: any;
        if(connectedDevice === null) {
            console.log(`no device connected`);
        }

        if(connectedDevice) {
            console.log(`creating read subscription with ${connectedDevice.name}`);
            subscription = connectedDevice.onDataReceived((event) => {
                console.log(`message received from device ${connectedDevice.name}`);
                console.log(`message: ${event.data}`);
                setBtdReceivedData(event.data);
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