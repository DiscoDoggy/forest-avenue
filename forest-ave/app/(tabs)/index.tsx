import { Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Forest Avenue</Text>

      <Toast 
        position='bottom'
        bottomOffset={20} 
      />

    </View>
  );
}
