import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Pressable, TextInput} from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { useBluetooth } from '../contexts/bluetoothContexts';
import { delimiter } from 'path';
import { AT_CMDS, ELM327_RESPONSES } from '@/constants/obdiiCommands';
import { readWithTimeout } from '../utils/readWithTimeout';

interface BlueToothDeviceCardProps {
    btd: BluetoothDevice //bluetooth device
    onPress: (btd: BluetoothDevice) => void;
}

export default function BluetoothConnScreen() {
    // we want to have a list of bonded bluetooth devices
    // user selects the device they are currently connected to 
    // make sure bluetooth is even turned on
    const {connectedDevice, setConnectedDevice, btdReceivedData} = useBluetooth();

    const [isBluetoothEnabled, setBluetoothEnabled] = useState(false);
    const [getBondedDevices, setBondedDevices]  = useState<BluetoothDevice[]>([]);
    const [getConnectedDeviceName, setConnectedDeviceName] = useState('no attempted connection');
    // const [getBtd, setBtd] = useState<BluetoothDevice | null>(bluetoothDeviceContext.connectedDevice);

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
        let connection = await btd.isConnected();
        if(!connection) {
            connection = await btd.connect({delimiter: '>'});
        }

        if(connection) {
            console.log(`connected to ${btd.name} successfully`);
            setConnectedDeviceName(btd.name);
            
            console.log('INITIALIZING OBD2 SETTINGS...');

            console.log('running ATE0 to turn off echo');
            const echo_off_cmd = AT_CMDS.ECHO_OFF;
            const isWriteSuccessful = await btd.write(`${echo_off_cmd}\r`);
            if(!isWriteSuccessful) {
                throw new Error('failed to send ATE0 instruction');
            }

            let res: string = await readWithTimeout(btd, 5000, 100);
            console.log(`ELM327 message: ${res}`);
            res = res.trim();
            console.log(`processed res: ${res}`);
            if(res === ELM327_RESPONSES.UNKNOWN_CMD) {
                throw new Error(`ELM327 received ${echo_off_cmd} but could not recognize command`);
            } else if (res !== ELM327_RESPONSES.AT_CMD_SUCCESS) {
                throw new Error(`ELM327 unknown error when running ${echo_off_cmd}`);
            }

            const bufClearSuccess = await btd.clear();
            if(!bufClearSuccess) {
                throw new Error(`Failed to clear device buffer`);
            }

            console.log('OBD2 SETUP COMPLETE');
            setConnectedDevice(btd);
        }
        else {
            console.log(`failed to connect to any device`);
            setConnectedDeviceName('not connected to any device');
        }
    }


    const handleSendingBtdMsg = async(btd: BluetoothDevice | null, msg: string) => {
        if(btd === null) { 
            console.error(`bluetooth device is null`);
            return;
        }
        const isDeviceConnected = await btd.isConnected();
        if(!isDeviceConnected) {
            console.error(`Attempted to send bluetooth message but no device connected`);
            return;
        }

        const isWriteSuccessful = await btd.write(msg);
        if(!isWriteSuccessful) {
            console.error(`Attempted to send bluetooth message but failed to write`);
            return;
        }

        console.log(`message ${msg} successfully written to ${btd.name}`);
    }

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
                    onSubmitEditing={async ()=> {handleSendingBtdMsg(connectedDevice, getBtTextbox)}}

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
                    {btdReceivedData}
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