import { MOCK_TRIPS } from "../../utils/dummyTrips";
import { FlatList, View } from "react-native";
import TripHistoryCard from "../../components/tripHistoryCard";
import { useSQLiteContext } from "expo-sqlite";
import { Trip, TripsDAO } from "@/db/trips";
import { useEffect, useState } from "react";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

export default function TripHistoryScreen() {
    //logic to read trips from memory and convert to good format

    const [trips, setTrips] = useState<Trip[]>([]);

    const db = useSQLiteContext();
    useDrizzleStudio(db);
    
    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const internalTables = await db.getAllAsync(
                "SELECT name FROM sqlite_master WHERE type='table';"
            );
            console.log("📊 CRITICAL DB VERIFICATION - LIVE TABLES:", internalTables);
                
                const tripsDao = new TripsDAO(db);
                const tripsFromDB = await tripsDao.getAllTrips();
                setTrips(tripsFromDB);
            } catch (e) {
                console.error('failed to fetch trips from local storage:', e);
            }
        }

        fetchTrips();
    }, [db]);

    return (
        <FlatList 
            data={trips} 
            renderItem={({item}) => <TripHistoryCard trip={item}  /> }
        />
    )
}
