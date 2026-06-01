import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Pressable, TextInput} from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { useBluetooth } from '../contexts/bluetoothContexts';
import { vehicleService } from '../services/vehicleService';
import Toast from "react-native-toast-message";
import { assertIsError } from '../utils/errors';

interface BlueToothDeviceCardProps {
    btd: BluetoothDevice //bluetooth device
    onPress: (btd: BluetoothDevice) => void;
}

export default function BluetoothConnScreen() {
    // we want to have a list of bonded bluetooth devices
    // user selects the device they are currently connected to 
    // make sure bluetooth is even turned on
    // const {connectedDevice, setConnectedDevice, btdReceivedData} = useBluetooth();

    const [isBluetoothEnabled, setBluetoothEnabled] = useState(false);
    const [getBondedDevices, setBondedDevices]  = useState<BluetoothDevice[]>([]);
    const [getConnectedDeviceName, setConnectedDeviceName] = useState('no attempted connection');
    // const [getBtd, setBtd] = useState<BluetoothDevice | null>(bluetoothDeviceContext.connectedDevice);
    const [getReceivedData, setReceivedData] = useState('no data received');
    const [getBtTextbox, setBtTextbox] = useState('placeholder');

    // this use effect is for getting the list of bonded devices which can change
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
    }, []);

    const handleBtdConnect = async(btd: BluetoothDevice) => {
        try{
            await vehicleService.connect(btd);
            setConnectedDeviceName(btd.name);
        } catch(error) {
            assertIsError(error);
            console.error(error);
            Toast.show({type: 'error', text1: error.message});
        }
    };

    const onTextSubmit = async() => {
        if(!vehicleService.obd2Client) {
            Toast.show({type: 'error', text1: 'connection to obd2client not detected'});
            return;
        }

        const res = await vehicleService.obd2Client.queryOBD2(getBtTextbox);
        setReceivedData(res);
    }


    // const handleSendingBtdMsg = async(btd: BluetoothDevice | null, msg: string) => {
    //     if(btd === null) { 
    //         console.error(`bluetooth device is null`);
    //         return;
    //     }
    //     const isDeviceConnected = await btd.isConnected();
    //     if(!isDeviceConnected) {
    //         console.error(`Attempted to send bluetooth message but no device connected`);
    //         return;
    //     }

    //     const isWriteSuccessful = await btd.write(msg);
    //     if(!isWriteSuccessful) {
    //         console.error(`Attempted to send bluetooth message but failed to write`);
    //         return;
    //     }

    //     console.log(`message ${msg} successfully written to ${btd.name}`);
    // }

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
                        renderItem={({item}) => <BluetoothDeviceCard btd={item} onPress={() => handleBtdConnect(item)}/>}
                        keyExtractor={item => item.id}
                    />
                </View>
            }

            <View>
                <TextInput 
                    onChangeText={setBtTextbox} 
                    value={getBtTextbox}
                    onSubmitEditing={onTextSubmit}

                />
            </View>
            <View>
                <Text style={styles.textHeaderStyle}>
                    Currently Connected Device:
                </Text>
                <Text style={styles.textRegularStyle}>
                    {getConnectedDeviceName}
                </Text>
                <Text style={styles.textHeaderStyle}>
                    Live Data:
                </Text>
                <Text style={styles.textRegularStyle}>
                    {getReceivedData}
                </Text>
            </View>
        </View>

    )

    // lets make a text box somewhere with enter abilities that lets me send a message 
    // to the bluetooth device and we can text hex shit here too
    // to test if this connection can persist across screens, we should with each screen sending a message
    // to the connected bluetooth device and seeing if the message goes through

};


function BluetoothDeviceCard({btd, onPress}: BlueToothDeviceCardProps) {
    return(
        <Pressable onPress={() => onPress(btd)}>
            <View style={styles.cardContainer}>
                <Text style={styles.bcDeviceStyle}>
                    {btd.name}
                </Text>
            </View>
        </Pressable>
    )
};

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        backgroundColor: '#000000',
        padding: 20,
    },

    bcDeviceStyle: {
        color: 'white',
        fontSize: 16
    },

    textHeaderStyle: {
        fontSize: 32
    },

    textRegularStyle: {
        fontSize: 12
    }
});