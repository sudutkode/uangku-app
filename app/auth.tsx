import {FinanceAppIllustration} from "@/components/illustrations";
import {Icon} from "@/components/ui";
import {useMutation} from "@/hooks/axios/use-mutation";
import {useAuthStore} from "@/store";
import {SignInResponse} from "@/types";
import {screenWidth} from "@/utils/common-utils";
import {
  GoogleSignin,
  SignInResponse as GoogleSignInResponse,
} from "@react-native-google-signin/google-signin";
import {StyleSheet, View} from "react-native";
import {Button, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

interface SigninPayload {
  email: string;
  name: string;
  avatar: string;
}

export default function AuthScreen() {
  const {colors} = useTheme();
  const {signin} = useAuthStore();

  const {mutate: mutateSignin, loading: loadingSignin} = useMutation<
    SignInResponse,
    SigninPayload
  >("/auth/google-sign-in");

  const handleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const res: GoogleSignInResponse = await GoogleSignin.signIn();
      const userGoogle = res.data?.user;
      const serverAuthCode = res.data?.serverAuthCode;

      console.log("serverAuthCode:", serverAuthCode);

      const payload = {
        email: userGoogle?.email || "",
        name: userGoogle?.name || "",
        avatar: userGoogle?.photo || "",
        serverAuthCode: serverAuthCode || undefined,
      };

      const data = await mutateSignin(payload);
      signin(data);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
    >
      <View style={{flex: 0.6}} />

      <View style={styles.illustrationContainer}>
        <FinanceAppIllustration
          width={screenWidth * 0.6}
          height={screenWidth * 0.6}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.textSection}>
          <Text
            variant="titleLarge"
            style={[styles.title, {color: colors.onSurface}]}
          >
            UangKu
          </Text>
          <Text
            variant="labelMedium"
            style={[styles.subtitle, {color: colors.secondary}]}
          >
            Manage your finances effortlessly and track every penny with ease.
          </Text>
        </View>

        <View style={styles.actionSection}>
          <Button
            mode="contained"
            onPress={handleSignIn}
            loading={loadingSignin}
            disabled={loadingSignin}
            style={styles.googleButton}
            contentStyle={styles.googleButtonContent}
            labelStyle={styles.googleLabel}
            buttonColor={colors.primary}
            textColor={colors.onPrimary}
            icon={({size, color}) => (
              <Icon name="google" size={size} color={color} />
            )}
          >
            Sign in with Google
          </Button>

          <Text
            variant="labelSmall"
            style={[styles.footerText, {color: colors.outline}]}
          >
            Secure login with Google OAuth 2.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  illustrationContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 2,
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  textSection: {
    alignItems: "center",
    marginTop: 8,
  },
  title: {
    fontWeight: "700",
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: 30,
  },
  actionSection: {
    width: "100%",
    alignItems: "center",
  },
  googleButton: {
    width: "100%",
    borderRadius: 14,
    elevation: 0,
  },
  googleButtonContent: {
    height: 52,
    flexDirection: "row-reverse",
  },
  googleLabel: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  footerText: {
    marginTop: 16,
    opacity: 0.5,
    fontSize: 10,
  },
});
