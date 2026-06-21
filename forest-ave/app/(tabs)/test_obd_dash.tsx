import { useState } from "react";
import { Button, Text, View } from "react-native";
import { useMpgDataStore } from "../services/mpgStateStore";
import { tripRecorder} from "../services/serviceContainer";

export default function BtdTestScreen() {
    const [isRecordingMpg, setIsRecordingMpg] = useState(false);

    const mpg = useMpgDataStore((state) => state.mpg);

    const startMpgPolling = () => {
        tripRecorder.mpgRecorder.startMPGPolling();
        setIsRecordingMpg(true);
    };

    const stopMpgPolling= () => {
        tripRecorder.mpgRecorder.stopMPGPolling();
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