import { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, Button } from 'react-native';

import { useBluetooth } from '../contexts/bluetoothContexts';

export default function BtObd2TestScreen() {
    const {connectedDevice, btdReceivedData} = useBluetooth();

    const noCurrDataStr = 'no current data';
    const noPrevDataStr = 'no previous data';
    const [cmdTxtBox, setCmdTxtBox] = useState('');

    const [prevDataTxt, setPrevDataTxt] = useState(noPrevDataStr);
    const prevDataRef = useRef(noPrevDataStr);

    const [currDataTxt, setCurrDataTxt]  = useState(noCurrDataStr);

    useEffect(() => {
        setPrevDataTxt(prevDataRef.current);
        setCurrDataTxt(btdReceivedData);
        prevDataRef.current = btdReceivedData;

    }, [btdReceivedData]);

    const handleSendOBDCmd = async(cmd: string) => {
        if(connectedDevice === null || !connectedDevice.isConnected()) {
            console.error(`error: connection to OBDII device could not be established`);
            return;
        }

        const isMsgSendSuccess = await connectedDevice.write(cmd);
        if(!isMsgSendSuccess) {
            console.error(`error: ${cmd} to obd2 device failed`);
            return;
        }
    }

    return (
        <View>
            <View>
                <TextInput 
                    onChangeText={setCmdTxtBox} 
                    value={cmdTxtBox}
                    onSubmitEditing={async ()=> {handleSendingBtdMsg(connectedDevice, getBtTextbox)}}
                />
            </View>

            <Button
                title='RPM' 
            />
            <Button 
                title='MAF' 
            />
            <Button 
                title='MAP' 
            />
            <Button 
                title='VSS' 
            />
            <Button 
                title='TEMPS' 
            />
            <Button 
                title='IAT' 
            />

            <Text>
                Previous Data Received:
            </Text>
            <Text>
                {prevDataTxt}
            </Text>

            <Text>
                Current Data Received:
            </Text>
                {currDataTxt}
        </View>
    )
}