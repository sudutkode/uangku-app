import { ManageMoney } from "@/components/illustrations";
import { useMutation } from "@/hooks/axios/use-mutation";
import { useAuthStore } from "@/store/auth-store";
import { SigninPayload, SignInResponse } from "@/types";
import {
  GoogleSignin,
  SignInResponse as GoogleSignInResponse,
} from "@react-native-google-signin/google-signin";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const { signin } = useAuthStore();

  const { mutate: mutateSignin, loading: loadingSignin } = useMutation<
    SignInResponse,
    SigninPayload
  >("/auth/google-sign-in");

  const handleSignIn = async () => {
    await GoogleSignin.hasPlayServices();

    const res: GoogleSignInResponse = await GoogleSignin.signIn();
    const userGoogle = res.data?.user;
    const payload = {
      email: userGoogle?.email || "",
      name: userGoogle?.name || "",
      avatar: userGoogle?.photo || "",
    };

    const data = await mutateSignin(payload);
    signin(data);
  };

  const isLoading = loadingSignin;

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ManageMoney width={260} height={260} />

      <View
        style={{ width: "100%", gap: 16, marginTop: 32, alignItems: "center" }}
      >
        <Text>Welcome to UangKu</Text>

        <Text>Manage your finances effortlessly</Text>

        <Button
          mode="contained"
          style={{ width: "100%" }}
          onPress={handleSignIn}
          loading={isLoading}
          disabled={isLoading}
        >
          Sign In
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
})