import { FuelStatsOverviewTimeFrame } from "@/constants/mpgConstants";

// lets have this bar chart be entierly responsible for fetching the 
// fuel consumption information by week, month, 3m, etc. 
// so that it can be fully in control of coloring and how the chart looks
// hoever the option for picking the aggregation timeline should come externally from 
// the parent so that the timeframe can be synced across multiple visualizations

interface FuelConsumptionBarChartProps {
    timeFrame: FuelStatsOverviewTimeFrame
}

export default function FuelConsumptionBarChart() {

    

}