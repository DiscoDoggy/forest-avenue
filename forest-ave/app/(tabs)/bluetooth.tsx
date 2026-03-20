import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList} from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';

interface BlueToothDeviceCardProps {
    name: string;
}

export default function BluetoothConnScreen() {
    // we want to have a list of bonded bluetooth devices
    // user selects the device they are currently connected to 
    // make sure bluetooth is even turned on

    const [isBluetoothEnabled, setBluetoothEnabled] = useState(false);
    const [getBondedDevices, setBondedDevices]  = useState<BluetoothDevice[]>([]);

    useEffect(() => {
        let isBluetoothEnabled: boolean;

        (async () => {
            // const hasPerms = await RNBluetoothClassic.request

            isBluetoothEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
            isBluetoothEnabled = await RNBluetoothClassic.isBluetoothEnabled();
            if(!isBluetoothEnabled) {
                setBluetoothEnabled(false);
            } 
            else {
                setBluetoothEnabled(true);

                const bondedDevices = await RNBluetoothClassic.getBondedDevices();
                setBondedDevices(bondedDevices);
            }
        })();
    })

    return (
        <View>
            {!isBluetoothEnabled ?
                <Text>
                    Bluetooth is currently disabled. Please enable bluetooth and connect to compatible OBD-II bluetooth device.
                </Text>
                :
                <View>
                    <FlatList 
                        data={getBondedDevices}
                        renderItem={({item}) => <BluetoothDeviceCard name={item.name}/>}
                        keyExtractor={item => item.id}
                    />
                </View>
            }
        </View>
    )

};

function BluetoothDeviceCard({name}: BlueToothDeviceCardProps) {
    return(
        <View>
            <Text>
                {name}
            </Text>
        </View>
    )
};