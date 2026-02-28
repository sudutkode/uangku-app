import {useAuthStore} from "@/store/auth-store";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {StyleSheet, View} from "react-native";
import {Button, useTheme} from "react-native-paper";

export default function AuthScreen() {
  const {colors} = useTheme();
  const {signout} = useAuthStore();

  const handleSignOut = () => {
    GoogleSignin.signOut();
    signout();
  };

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={handleSignOut}
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
