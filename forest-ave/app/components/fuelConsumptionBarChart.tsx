import { AggregatedFuelStat } from '@/db/trips';
import { BarChart } from 'react-native-gifted-charts';

/*
The data passed in should be a state variable that is a json list storing for each entry
the Date and the fuel consumption on that date
*/

export type datedFuelConsumption = Pick<AggregatedFuelStat, 'date' | 'totalFuelConsumption'>;

export interface FuelConsumptionProps {
    data: datedFuelConsumption[];
    chartWidth: number;
}

export default function FuelConsumptionBarChart({data, chartWidth}: FuelConsumptionProps) {
    // need to convert data to json list
    let processedData = [];
    for(const pair of data) {
        processedData.push({
            label: pair.date,
            value: pair.totalFuelConsumption
        });
    }

    const yAxisLabelWidth = 35;
    const chartAreaWidth = Math.max(chartWidth - yAxisLabelWidth, 0);

    return (
        <BarChart 
            data={processedData} 
            width={chartAreaWidth}
            height={240}
            barBorderRadius={16}
            adjustToWidth={true}
            disableScroll={true}
            initialSpacing={8}
            endSpacing={8}
            yAxisLabelWidth={yAxisLabelWidth}
            yAxisThickness={1}
            xAxisThickness={0}
            frontColor={'#69ff96'}
            showReferenceLine1
        />
    );

}