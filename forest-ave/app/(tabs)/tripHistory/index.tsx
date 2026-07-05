import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import TripHistoryScreen from "./trip_history";
import TripsOverview from "./trips_overview";

const TopTabs = createMaterialTopTabNavigator();

export default function TripHistoryTopTabsScreen() {
    return (
        <TopTabs.Navigator>
            <TopTabs.Screen
                name="trips_overview"
                component={TripsOverview}
                options={{
                    title: "Overview"
                }}
            />

            <TopTabs.Screen
                name="trip_history"
                component={TripHistoryScreen}
                options={{
                    title: "Trips"
                }}
            />
        </TopTabs.Navigator>
    );
}
