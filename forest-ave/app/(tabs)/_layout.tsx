import { Tabs } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { BluetoothDeviceContextProvider } from "../contexts/bluetoothContexts";

export default function TabsLayout() {
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
                    name="trip_map" 
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
            </Tabs>
        </BluetoothDeviceContextProvider>

    );
}