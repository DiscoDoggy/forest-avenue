import { Stack } from "expo-router";

export default function TripHistoryLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false
                }}
            />

            <Stack.Screen
                name="[tripId]"
                options={{
                    title: "Trip Details",
                    headerShown: false
                }}
            />
        </Stack>
    );
}