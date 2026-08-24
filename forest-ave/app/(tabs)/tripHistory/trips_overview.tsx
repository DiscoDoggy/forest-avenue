import FuelConsumptionBarChart, { datedFuelConsumption } from "@/app/components/fuelConsumptionBarChart";
import { TripStatCard } from "@/app/components/tripOverviewStatCard";
import { FuelStatsOverviewTimeFrame } from "@/constants/mpgConstants";
import {AggregatedFuelStat, Trip, TripsDAO} from "@/db/trips"
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const mockFuelConsumptionData: datedFuelConsumption[] = [
    { date: 'Mon', totalFuelConsumption: 2.4 },
    { date: 'Tue', totalFuelConsumption: 3.1 },
    { date: 'Wed', totalFuelConsumption: 1.8 },
    { date: 'Thu', totalFuelConsumption: 4.2 },
    { date: 'Fri', totalFuelConsumption: 3.6 },
    { date: 'Sat', totalFuelConsumption: 2.7 },
    { date: 'Sun', totalFuelConsumption: 1.4 },
];

export default function TripsOverview() {
    const [tripsFuelStats, setTripsFuelStats] = useState<AggregatedFuelStat[]> ([]);
    const [fuelConsumptionStat, setFuelConsumptionStat] = useState<datedFuelConsumption[]>(mockFuelConsumptionData);
    const [timeframe, setTimeframe] = useState<FuelStatsOverviewTimeFrame>(FuelStatsOverviewTimeFrame.ONE_WEEK);

    const [chartWidth, setChartWidth] = useState(0);

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
    }, [db, timeframe]);

    return (
        <View>
            <View>
                <TripStatCard>
                    <TripStatCard.Title>Fuel Consumption</TripStatCard.Title>
                    <TripStatCard.Body
                        onLayout={(e) => {
                            setChartWidth(e.nativeEvent.layout.width)
                        }} 
                    >
                        {chartWidth > 0 && (
                            <FuelConsumptionBarChart
                                data={fuelConsumptionStat}
                                chartWidth={chartWidth}
                            />
                        )}
                    </TripStatCard.Body>
                </TripStatCard>
            </View>

            <View style={styles.statCardsContainers}>

                <View style={styles.statCardRow}>
                    <View style={styles.statCard}>
                        <TripStatCard>
                            <TripStatCard.Title>Fuel Consumption</TripStatCard.Title>
                            <TripStatCard.Body>
                                <Text>45 Gal</Text>
                            </TripStatCard.Body>
                        </TripStatCard>
                    </View>

                    <View style={styles.statCard}>
                        <TripStatCard>
                            <TripStatCard.Title>Distance</TripStatCard.Title>
                            <TripStatCard.Body>
                                <Text>123 mi</Text>
                            </TripStatCard.Body>
                        </TripStatCard>
                    </View>
                </View>

                <View style={styles.statCardRow}>
                    <View style={styles.statCard}>
                        <TripStatCard>
                            <TripStatCard.Title>Fuel Costs</TripStatCard.Title>
                            <TripStatCard.Body>
                                <Text>$300.00</Text>
                            </TripStatCard.Body>
                        </TripStatCard>
                    </View> 

                    <View style={styles.statCard}>
                        <TripStatCard>
                            <TripStatCard.Title>Avg MPG</TripStatCard.Title>
                            <TripStatCard.Body>
                                <Text>45 MPG</Text>
                            </TripStatCard.Body>
                        </TripStatCard>
                    </View>
                </View>

            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    statCardsContainers: {
        marginVertical: 10,
    },
    statCardRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    statCard: {
        flex: 1
    }
    

});