import { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, Button } from 'react-native';

import { useBluetooth } from '../contexts/bluetoothContexts';

import { OBDPIDProcessor, OBDPIDS } from '@/app/utils/obdiiCommands';

import { Buffer } from 'buffer';
import { handleSendOBDCmd } from '../utils/sendOBDCmds';
import { calculateInstMPG, calculateInstMPGWithoutFuelTrims } from '../utils/mpg';

export default function BtObd2TestScreen() {
    const {connectedDevice, readChannel, btdReceivedData} = useBluetooth();

    const noCurrDataStr = 'no current data';
    const noPrevDataStr = 'no previous data';
    const [cmdTxtBox, setCmdTxtBox] = useState('');

    const [prevDataTxt, setPrevDataTxt] = useState<string | number | null>(noPrevDataStr);
    const prevDataRef = useRef<string | number | null>(noPrevDataStr);

    const [currDataTxt, setCurrDataTxt]  = useState<string | number | null>(noCurrDataStr);
    const [mpg, setMPG] = useState(-1);

    useEffect(() => {
        setPrevDataTxt(prevDataRef.current);
        setCurrDataTxt(btdReceivedData);
        prevDataRef.current = btdReceivedData;

    }, [btdReceivedData]);

    const calcMPG = async () => {
        try {
            // await OBDPIDS.STFT1.runCmdOnOBD(connectedDevice);
            // const STFT = await readChannel.readWithTimeout() as number;
            // console.log(`STFT: ${STFT}`);

            // await OBDPIDS.LTFT1.runCmdOnOBD(connectedDevice);
            // const LTFT = await readChannel.readWithTimeout() as number;
            // console.log(`LTFT: ${LTFT}`);

            await OBDPIDS.vehicleSpeed.runCmdOnOBD(connectedDevice);
            const vehicleSpeed = await readChannel.readWithTimeout() as number;
            console.log(`vehicle speed: ${vehicleSpeed}`);

            await OBDPIDS.MAF.runCmdOnOBD(connectedDevice);
            const MAF = await readChannel.readWithTimeout() as number;
            console.log(`MAF: ${MAF}`);
            
            // const mpg = calculateInstMPG(STFT, LTFT, MAF, vehicleSpeed);
            const mpg = calculateInstMPGWithoutFuelTrims(MAF, vehicleSpeed);
            setMPG(mpg);
        } catch(error) {
            console.error(`error getting components for gas mileage calculation: ${error}`);
        }
    }

    return (
        <View>
            <View>
                <TextInput 
                    onChangeText={setCmdTxtBox} 
                    value={cmdTxtBox}
                    onSubmitEditing={async () => {await handleSendOBDCmd(connectedDevice, cmdTxtBox)}}
                />
            </View>

            <Button
                title='RPM' 
                onPress={async () => {await OBDPIDS.RPM.runCmdOnOBD(connectedDevice)}}
            />
            <Button 
                title='MAF' 
                onPress={async () => {await OBDPIDS.MAF.runCmdOnOBD(connectedDevice)}}
            />
            <Button 
                title='MAP' 
                onPress={async () => {await OBDPIDS.MAP.runCmdOnOBD(connectedDevice)}}
            />
            <Button 
                title='VSS' 
                onPress={async () => {await OBDPIDS.vehicleSpeed.runCmdOnOBD(connectedDevice)}}
            />
            <Button 
                title='IAT' 
                onPress={async () => {await OBDPIDS.IAT.runCmdOnOBD(connectedDevice)}}
            />

            <Button 
                title='Calculate Gas Mileage'
                onPress={async () => {await calcMPG()}}
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

            <Text>
                current gas mileage:
            </Text>

            <Text>
                {mpg}
            </Text>
        </View>
    )
}