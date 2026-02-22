import {ThemedText} from "@/components/themed-text";
import {useRouter} from "expo-router";
import {Button, StyleSheet, View} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const login = () => {
    router.navigate("/");
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Welcome!</ThemedText>
      <Button title="Login with Google" onPress={login} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: "center", alignItems: "center"},
});
