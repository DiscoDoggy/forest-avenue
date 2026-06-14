import { useState } from "react";
import { Button, Text, View } from "react-native";
import { useMpgDataStore } from "../services/mpgStateStore";
import { vehicleService } from "../services/serviceContainer";

export default function BtdTestScreen() {
    const [isRecordingMpg, setIsRecordingMpg] = useState(false);

    const mpg = useMpgDataStore((state) => state.mpg);

    const startMpgPolling = () => {
        vehicleService.mpgPollingService?.startMPGPolling();
        setIsRecordingMpg(true);
    };

    const stopMpgPolling= () => {
        vehicleService.mpgPollingService?.stopMPGPolling();
        setIsRecordingMpg(false);
    };

    return (
        <View>
            <Text>Current MPG {mpg}</Text>
            <Button 
                title="Start"
                disabled={isRecordingMpg}
                onPress={startMpgPolling}
            />

            <Button 
                title="Stop" 
                disabled={!isRecordingMpg} //disable if we are not currently recording
                onPress={stopMpgPolling} 
            />
        </View>
    )
}