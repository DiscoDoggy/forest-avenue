import { Tabs } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabsLayout() {
    return (
        <Tabs
           
        >
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
        </Tabs>
    );
}