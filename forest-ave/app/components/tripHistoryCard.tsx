import { StyleSheet, View, Text } from 'react-native';
import { Trip } from "@/db/trips";
import { convertUnixTimeToLocalDateTime } from '../utils/dateTimeConversion';

interface TriphistoryCardProps {
    trip: Trip
}

export default function TripHistoryCard({trip}: TriphistoryCardProps) {

    return (
        <View>
            <Text>{trip.tripName}</Text>
            
            <View style={styles.mpgAndSpeedContainter}>
                <Text>{trip.tripAggResults.avgMpg}</Text>
                <Text>{trip.tripAggResults.avgSpeed}</Text>
            </View>

            <Text>{trip.tripAggResults.distanceTraveled}</Text>

            <Text>{convertUnixTimeToLocalDateTime(trip.startTime)} - {convertUnixTimeToLocalDateTime(trip.endTime)}</Text>

        </View>
    )
}

const styles = StyleSheet.create({
    mpgAndSpeedContainter: {
        flex:1,
        flexDirection:'row'
    }
});