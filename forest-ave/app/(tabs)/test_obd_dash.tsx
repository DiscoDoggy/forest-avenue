import { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, Button } from 'react-native';

import { useBluetooth } from '../contexts/bluetoothContexts';

import { OBDPIDProcessor, OBDPIDS } from '@/constants/obdiiCommands';

import { Buffer } from 'buffer';

export default function BtObd2TestScreen() {
    const {connectedDevice, btdReceivedData} = useBluetooth();

    const noCurrDataStr = 'no current data';
    const noPrevDataStr = 'no previous data';
    const [cmdTxtBox, setCmdTxtBox] = useState('');

    const [prevDataTxt, setPrevDataTxt] = useState<string | number>(noPrevDataStr);
    const prevDataRef = useRef<string | number>(noPrevDataStr);

    const [currDataTxt, setCurrDataTxt]  = useState<string | number>(noCurrDataStr);

    useEffect(() => {
        setPrevDataTxt(prevDataRef.current);
        setCurrDataTxt(btdReceivedData);
        prevDataRef.current = btdReceivedData;

    }, [btdReceivedData]);

    const handleSendOBDCmd = async(cmd: string) => {

        console.log(`attempting to send message: ${cmd} to device: ${connectedDevice?.name}`);
        if(connectedDevice === null || !connectedDevice.isConnected()) {
            console.error(`error: connection to OBDII device could not be established`);
            return;
        }
        // const finalCmd = cmd.replace(/\s+/g, '').toUpperCase();
        // const base64Data = Buffer.from(finalCmd, 'ascii').toString('base64');

        const isMsgSendSuccess = await connectedDevice.write(`${cmd}\r`);
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
                    onSubmitEditing={async () => {await handleSendOBDCmd(cmdTxtBox)}}
                />
            </View>

            <Button
                title='RPM' 
                onPress={async () => {await handleSendOBDCmd(OBDPIDS.RPM.command)}}
            />
            <Button 
                title='MAF' 
                onPress={async () => {await handleSendOBDCmd(OBDPIDS.MAF.command)}}
            />
            <Button 
                title='MAP' 
                onPress={async () => {await handleSendOBDCmd(OBDPIDS.MAP.command)}}
            />
            <Button 
                title='VSS' 
                onPress={async () => {await handleSendOBDCmd(OBDPIDS.vehicleSpeed.command)}}
            />
            <Button 
                title='IAT' 
                onPress={async () => {await handleSendOBDCmd(OBDPIDS.IAT.command)}}
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
            <Text>
                {currDataTxt}
            </Text>
        </View>
    )
}