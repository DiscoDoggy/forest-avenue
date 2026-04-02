import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Pressable, TextInput} from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';

interface BlueToothDeviceCardProps {
    btd: BluetoothDevice //bluetooth device
    onPress: (btd: BluetoothDevice) => void;
}

export default function BluetoothConnScreen() {
    // we want to have a list of bonded bluetooth devices
    // user selects the device they are currently connected to 
    // make sure bluetooth is even turned on

    const [isBluetoothEnabled, setBluetoothEnabled] = useState(false);
    const [getBondedDevices, setBondedDevices]  = useState<BluetoothDevice[]>([]);
    const [getConnectedDeviceName, setConnectedDeviceName] = useState('no attempted connection');
    const [getBtdReceivedData, setBtdReceivedData] = useState<string>('no data');
    const [getBtd, setBtd] = useState<BluetoothDevice | null>(null);

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

    // should only be responsible for setting the subscription to incoming bluetooth data for a connected device
    useEffect(() => {
        let subscription: any;
        if(getBtd !== null) {
            console.log(`use effect currently connected device is ${getBtd?.name}`);
        }
        if(getBtd) {
            console.log(`creating read subscription with ${getBtd.name}`);
            subscription = getBtd.onDataReceived((event) => {
                console.log(`message received from device ${getBtd.name}`);
                console.log(`message: ${event.data}`);
                setBtdReceivedData(event.data);
            });
        }

        return () => {
            if(subscription && getBtd) {
                console.log(`unsubscribing ${getBtd.name} from receiving data events`);
                subscription.remove();
            }
        }

    }, [getBtd]);

    const handleBtdConnect = async(btd: BluetoothDevice) => {
        let connection = await btd.isConnected();
        if(!connection) {
            connection = await btd.connect()
        }

        if(connection) {
            console.log(`connected to ${btd.name} successfully`);
            setConnectedDeviceName(btd.name);
            setBtd(btd);
            await btd.write("HELLO FROM PHONE\r");
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
        
        if(!btd.isConnected()) {
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
                    onSubmitEditing={async ()=> {handleSendingBtdMsg(getBtd, getBtTextbox)}}

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
                    {getBtdReceivedData}
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