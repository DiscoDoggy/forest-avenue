import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Trip } from "@/db/trips";
import { convertUnixTimeToLocalDateTime } from '../utils/dateTimeConversion';
import { useRouter } from 'expo-router';

interface TriphistoryCardProps {
    trip: Trip;
}

export default function TripHistoryCard({trip}: TriphistoryCardProps) {
    const router = useRouter();
    const handleTripPressed = () => {
        router.navigate(`/(tabs)/tripHistory/[tripId]`)
    }

    return (
        <Pressable
            onPress={handleTripPressed}
        >
            <View style={styles.card}>
                <Text style={styles.title}>{trip.tripName}</Text>
                
                <View>
                    <Text>Average MPG: {trip.tripAggResults.avgMpg}</Text>
                    <Text>Average speed: {trip.tripAggResults.avgSpeed}</Text>
                </View>

                <Text>Distance Traveled: {trip.tripAggResults.distanceTraveled} miles</Text>

                <Text style={styles.tripTime}>{(trip.startTime)} - {(trip.endTime)}</Text>

            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor:'#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 5
    },

    title: {
        fontSize: 18,
        fontWeight: 'bold'
    },

    tripTime: {
        fontSize: 13,
        color: '#636363'
    } 

    // mpgAndSpeedContainter: {
    //     flex:1,
    //     flexDirection:'row'
    // }
});