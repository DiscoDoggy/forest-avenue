import {Trip, TripsDAO} from "@/db/trips"
import { useState } from "react";
import { Text, View } from "react-native";

export default function TripsOverview() {
    const [trips, setTrips] = useState<Trip[]> ([]);

    return (
        <View>
            <Text>Overview Screen</Text>
        </View>
    )
}