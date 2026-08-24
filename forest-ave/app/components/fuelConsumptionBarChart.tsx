import { AggregatedFuelStat } from '@/db/trips';
import { View, Text} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

/*
The data passed in should be a state variable that is a json list storing for each entry
the Date and the fuel consumption on that date
*/

export type datedFuelConsumption = Pick<AggregatedFuelStat, 'date' | 'totalFuelConsumption'>;

export interface FuelConsumptionProps {
    data: datedFuelConsumption[];
}

export default function FuelConsumptionBarChart({data}: FuelConsumptionProps) {
    // need to convert data to json list
    let processedData = [];
    for(const pair of data) {
        processedData.push({
            label: pair.date,
            value: pair.totalFuelConsumption
        })
    }

    return (
        <BarChart data={processedData} />
        // <View><Text>Placeholder bar chart</Text></View>
    );

}