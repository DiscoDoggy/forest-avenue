import FuelConsumptionBarChart, { datedFuelConsumption } from "@/app/components/fuelConsumptionBarChart";
import { TripStatCard } from "@/app/components/tripOverviewStatCard";
import { FuelStatsOverviewTimeFrame } from "@/constants/mpgConstants";
import {AggregatedFuelStat, Trip, TripsDAO} from "@/db/trips"
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function TripsOverview() {
    const [tripsFuelStats, setTripsFuelStats] = useState<AggregatedFuelStat[]> ([]);
    const [fuelConsumptionStat, setFuelConsumptionStat] = useState<datedFuelConsumption[]>([]);
    const [timeframe, setTimeframe] = useState<FuelStatsOverviewTimeFrame>(FuelStatsOverviewTimeFrame.ONE_WEEK);
    const [foundTrips, setFoundTrips] = useState(false);
    const [didError, setDidError] = useState(false);

    const db = useSQLiteContext();
    useEffect( () => {
        const fetchTripsStats = async () => {
            try{
                const tripsDao = new TripsDAO(db);
                const tripStatsFromDB = await tripsDao.getTripAggregatedStatsByTimeFrame(timeframe);
                if(tripStatsFromDB) {
                    setFoundTrips(true);
                    setTripsFuelStats(tripStatsFromDB);

                }
            } catch(e) {
                setDidError(true);
            }
        }

        fetchTripsStats();
    });

    return (
        <View>
            <FuelConsumptionBarChart data={fuelConsumptionStat} />


            <View style={styles.StatCardRow}>

                <TripStatCard>
                    <TripStatCard.Title>Fuel Consumption</TripStatCard.Title>
                    <TripStatCard.Body>
                        <Text>45 Gal</Text>
                    </TripStatCard.Body>
                </TripStatCard>

                <TripStatCard>
                    <TripStatCard.Title>Distance</TripStatCard.Title>
                    <TripStatCard.Body>
                        <Text>123 mi</Text>
                    </TripStatCard.Body>
                </TripStatCard>

            </View>

            <View style={styles.StatCardRow}>
                
                <TripStatCard>
                    <TripStatCard.Title>Fuel Costs</TripStatCard.Title>
                    <TripStatCard.Body>
                        <Text>$300.00</Text>
                    </TripStatCard.Body>
                </TripStatCard>

                <TripStatCard>
                    <TripStatCard.Title>Avg MPG</TripStatCard.Title>
                    <TripStatCard.Body>
                        <Text>45 MPG</Text>
                    </TripStatCard.Body>
                </TripStatCard>

            </View>

        </View>

    )
}

const styles = StyleSheet.create({
    StatCardRow: {
        flex: 1,
        flexDirection: 'row'
    },

});