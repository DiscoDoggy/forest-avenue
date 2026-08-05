import { Tabs } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { BluetoothDeviceContextProvider } from "../contexts/bluetoothContexts";
import { useSQLiteContext } from "expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

export default function TabsLayout() {
    const db = useSQLiteContext()
    useDrizzleStudio(db) ;
    
    return (
        <BluetoothDeviceContextProvider>
            <Tabs>
                <Tabs.Screen 
                    name="index" 
                    options={{ 
                        title: 'Home',
                        tabBarIcon: ({color, focused}) => (
                            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                        ),
                    }} 
                    
                />
            
                <Tabs.Screen 
                    name="trip_map_testing" 
                    options={{ 
                        title: 'Drive',
                        tabBarIcon: ({color, focused}) => (
                            <Ionicons name={focused ? 'car-sharp' : 'car-outline'} color={color} size={24} />
                        ),
                    }} 
                />

                <Tabs.Screen 
                    name="bluetooth" 
                    options={{
                        title: 'Bluetooth',
                        tabBarIcon: ({color, focused}) => (
                            <Ionicons name={focused ? 'bluetooth-sharp' : 'bluetooth-outline'} color={color} size={24} />
                        ),
                    }}
                />

                <Tabs.Screen 
                    name="test_obd_dash" 
                    options={{
                        title: 'Test Dash',
                        tabBarIcon: ({color, focused}) => (
                            <Ionicons name={focused ? 'bar-chart-outline' : 'bar-chart-outline'} color={color} size={24} />
                        ),
                    }}
                />

                <Tabs.Screen 
                    name="tripHistory" 
                    options={{
                        title: 'Trips',
                        tabBarIcon: ({color, focused}) => (
                            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={24} />
                        ),
                    }}
                />
            </Tabs>
        </BluetoothDeviceContextProvider>
    );
}