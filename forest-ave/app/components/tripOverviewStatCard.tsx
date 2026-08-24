import { StyleSheet, Text, TextProps, View, ViewProps } from "react-native";

interface TripStatCardProps extends ViewProps {}
export function TripStatCard({style, children, ...restProps}: TripStatCardProps) {
    
    return(
        <View style={styles.card}>
            {children}
        </View>
    )
}

interface TripStatCardTitleProps extends TextProps{}
export function TripStatCardTitle({style, children, ...restProps}: TripStatCardTitleProps) {
    return(
        <Text style={styles.title}>{children}</Text>
    )
}

interface TripStatCardDescProps extends TextProps {}
export function TripStatCardDesc({style, children, ...restProps}: TripStatCardDescProps) {
    return (
        <Text>{children}</Text>
    )
}

interface TripStatCardBody extends ViewProps {}
export function TripStatCardBody({style, children, ...restProps}: TripStatCardBody) {
    return (
        <View>{children}</View>
    )
}

TripStatCard.Title = TripStatCardTitle;
TripStatCard.Description = TripStatCardDesc;
TripStatCard.Body = TripStatCardBody;

const styles = StyleSheet.create({
    card: {
        flex: 1,
        flexDirection: 'column',
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 8,
        marginVertical: 8,
        },
    title: {
        fontSize: 16,
        color: '#f00000'
    }
})