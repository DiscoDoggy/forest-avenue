import FuelConsumptionBarChart, { datedFuelConsumption } from "@/app/components/fuelConsumptionBarChart";
import { TripStatCard } from "@/app/components/tripOverviewStatCard";
import { FuelStatsOverviewTimeFrame } from "@/constants/mpgConstants";
import {AggregatedFuelStat, Trip, TripsDAO} from "@/db/trips"
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState, useMemo, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Host } from '@expo/ui';
// import SegmentedControl from '@expo/ui/community/segmented-control';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const mockFuelConsumptionData: datedFuelConsumption[] = [
    { date: 'Mon', totalFuelConsumption: 2.4 },
    { date: 'Tue', totalFuelConsumption: 3.1 },
    { date: 'Wed', totalFuelConsumption: 1.8 },
    { date: 'Thu', totalFuelConsumption: 4.2 },
    { date: 'Fri', totalFuelConsumption: 3.6 },
    { date: 'Sat', totalFuelConsumption: 2.7 },
    { date: 'Sun', totalFuelConsumption: 1.4 },
];

type timeframeControlText = "1 Week" | "3 Months" | "6 Months" | "1 Year" | "YTD";
const timeframeControlTextToTimeframe: Record<timeframeControlText, FuelStatsOverviewTimeFrame> = {
    "1 Week": FuelStatsOverviewTimeFrame.ONE_WEEK,
    "3 Months": FuelStatsOverviewTimeFrame.THREE_MONTHS,
    "6 Months": FuelStatsOverviewTimeFrame.SIX_MONTHS,
    "1 Year": FuelStatsOverviewTimeFrame.ONE_YEAR,
    "YTD": FuelStatsOverviewTimeFrame.YTD
}

export default function TripsOverview() {
    const [tripsFuelStats, setTripsFuelStats] = useState<AggregatedFuelStat[]> ([]);
    const [fuelConsumptionStat, setFuelConsumptionStat] = useState<datedFuelConsumption[]>(mockFuelConsumptionData);
    const [timeframe, setTimeframe] = useState<FuelStatsOverviewTimeFrame>(FuelStatsOverviewTimeFrame.ONE_WEEK);

    const [timeframeIdx, setTimeFrameIdx] = useState(0);

    const [chartWidth, setChartWidth] = useState(0);

    const [foundTrips, setFoundTrips] = useState(false);
    const [didError, setDidError] = useState(false);


    const db = useSQLiteContext();
    const tripsDao = useMemo(() => {
        return new TripsDAO(db)
    }, [db]);

    const fetchTripStats= useCallback((userTimeFrame: FuelStatsOverviewTimeFrame) => {
        const getTripsData = async () => {
            try{
                const tripStatsFromDB = await tripsDao.getTripAggregatedStatsByTimeFrame(userTimeFrame);
                if(tripStatsFromDB) {
                    setFoundTrips(true);
                    setTripsFuelStats(tripStatsFromDB);
                }
            } catch(e) {
                setDidError(true);
            } 
        }    
        getTripsData()
    }, [tripsDao]); 


    useEffect( () => {
        const getTripsData = async () => {
            await fetchTripStats(timeframe);
        }

        getTripsData();
    }, [fetchTripStats, timeframe ]);

    return (
        <View>
            
            <View>
                <SegmentedControl 
                    values={Object.keys(timeframeControlTextToTimeframe)} 
                    selectedIndex={timeframeIdx}
                    onChange={event => {
                        setTimeFrameIdx(event.nativeEvent.selectedSegmentIndex);
                        setTimeframe(timeframeControlTextToTimeframe[event.nativeEvent.value as timeframeControlText])
                        //explicitly querying the data here is not needed because the state change of timeframe triggers the 
                        //useEffect statement which rerenders everything with the updated data bounded by the timeframe
                    }}
                    // --- Outer Track Background Color ---
                    backgroundColor="#111827"
        
                    // --- Active Button / Selected Pill Color ---
                    tintColor="#2563EB"
                    
                    // --- Active Selected Text Styles ---
                    activeFontStyle={{
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontSize: 13,
                    }}
                    
                    // --- Inactive / Unselected Text Styles ---
                    fontStyle={{
                        color: '#9CA3AF',
                        fontWeight: '500',
                        fontSize: 13,
                    }}
                    style={{backgroundColor:'#FFFFFF'}}
                />
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