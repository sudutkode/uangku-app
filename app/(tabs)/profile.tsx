import { useAuthStore } from "@/store/auth-store";
import { StyleSheet, View } from "react-native";
import { Button, useTheme } from "react-native-paper";

export default function AuthScreen() {
  const { colors } = useTheme();
  const {signout} = useAuthStore();

  return (
    <View style={styles.container}>
      <Button
          mode="contained"
          onPress={signout}
          buttonColor={colors.error}
        >
          Sign Out
        </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: "center", alignItems: "center"},
});
