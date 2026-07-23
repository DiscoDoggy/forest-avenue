import Ionicons from "@expo/vector-icons/Ionicons"
import { StyleSheet, Text, View } from "react-native"

interface MapControlButtonProps {
    name: string
    iconName: 'location-sharp' | 'paper-plane-sharp' | 'stop-circle-sharp'
    
    iconColor: string
    iconSize?: number

    fontSize?: number
    
    horizPadding?: number
    vertPadding?: number
}


export default function MapControlButton({name, 
    iconName, 
    iconColor,
    iconSize = 16,
    fontSize = 24,
    horizPadding = 32,
    vertPadding = 32
}: MapControlButtonProps) {

    return (
        <View style={[
            styles.mapButtonStyle,
            {
                paddingHorizontal: horizPadding,
                paddingVertical: vertPadding
            }
        ]}>
            <Text style={{fontSize: fontSize}}>{name}</Text>
            <Ionicons name={iconName} color={iconColor} size={iconSize}/>
        </View>
    )
}

const styles = StyleSheet.create({
    mapButtonStyle: {
        flexDirection: 'row',
        // justifyContent: 'space-evenly',
        borderRadius: 16,
        marginLeft: 10,
    
        backgroundColor: '#FFFFFF',
    }
})