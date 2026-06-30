import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";

const TopTabs = withLayoutContext(
    createMaterialTopTabNavigator().Navigator,
    undefined,
    true
);

export default function TopTabsLayout() {
    return (
        <TopTabs>
            <TopTabs.Screen 
                name="trips_overview"    
                options={{
                    title: "Overview"
                }}
            />

            <TopTabs.Screen 
                name="trip_history"            
                options={{
                    title: "Trips"
                }}
            />

        </TopTabs>
    );
}