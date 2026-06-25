import { StyleSheet, View, Text } from "react-native";

interface MapStatWidgetProps {
    value: number;
    title: string
}
export default function MapStatWidget({value, title}: MapStatWidgetProps) {

    return (
        <View style={styles.statWidgetStyle}>
            <Text>{value} </Text>
            <Text>{title}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    statWidgetStyle: {
        backgroundColor: '#ffffff',

        flex: 1,
        flexDirection: 'row',

        borderRadius: 16,
        padding:4
    }
})