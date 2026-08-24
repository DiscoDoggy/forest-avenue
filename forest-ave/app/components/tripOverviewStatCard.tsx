import { StyleSheet, Text, TextProps, View, ViewProps } from "react-native";

interface TripStatCardProps extends ViewProps {}
export function TripStatCard({style, children, ...restProps}: TripStatCardProps) {
    
    return(
        <View style={[styles.card, style]} {...restProps}>
            {children}
        </View>
    )
}

interface TripStatCardTitleProps extends TextProps{}
export function TripStatCardTitle({style, children, ...restProps}: TripStatCardTitleProps) {
    return(
        <Text style={[styles.title, style]} {...restProps}>{children}</Text>
    )
}

interface TripStatCardDescProps extends TextProps {}
export function TripStatCardDesc({style, children, ...restProps}: TripStatCardDescProps) {
    return (
        <Text style={style} {...restProps}>{children}</Text>
    )
}

interface TripStatCardBody extends ViewProps {}
export function TripStatCardBody({style, children, ...restProps}: TripStatCardBody) {
    return (
        <View style={style} {...restProps}>{children}</View>
    )
}

TripStatCard.Title = TripStatCardTitle;
TripStatCard.Description = TripStatCardDesc;
TripStatCard.Body = TripStatCardBody;

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 8,
        marginVertical: 8,
        minHeight: 96,
        },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    }
})