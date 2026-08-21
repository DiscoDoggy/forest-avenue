import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

/*
the data should be passed in as a [{
    date
    fuelConsumption
}]:
We can then append keys to each block that contain styling etc.
*/

export default function FuelConsumptionBarChart() {

    return (
        <View>
            <BarChart />
        </View>
    );

}