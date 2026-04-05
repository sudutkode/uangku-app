import {FinanceAppIllustration} from "@/components/illustrations";
import {Icon} from "@/components/ui";
import {useMutation} from "@/hooks/axios";
import {useAuthStore} from "@/store";
import {SignInResponse} from "@/types";
import {screenWidth} from "@/utils";
import {
  GoogleSignin,
  SignInResponse as GoogleSignInResponse,
} from "@react-native-google-signin/google-signin";
import {useState} from "react";
import {StyleSheet, View} from "react-native";
import {Button, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

interface SigninPayload {
  idToken: string;
}

export default function AuthScreen() {
  const {colors} = useTheme();
  const {signin} = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {mutate: mutateSignin, error} = useMutation<
    SignInResponse,
    SigninPayload
  >("/auth/google-sign-in");

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const res: GoogleSignInResponse = await GoogleSignin.signIn();

      const idToken = res.data?.idToken;
      if (!idToken) return;

      const data = await mutateSignin({idToken});
      signin(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
    >
      <View style={styles.illustrationContainer}>
        <FinanceAppIllustration
          width={screenWidth * 0.55}
          height={screenWidth * 0.55}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.textSection}>
          <Text variant="titleMedium" style={styles.title}>
            UangKu
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.subtitle, {color: colors.onSurfaceVariant}]}
          >
            Catat semua transaksimu secara otomatis.
          </Text>
        </View>

        <View style={styles.actionSection}>
          <Button
            mode="contained"
            onPress={handleSignIn}
            loading={loading}
            disabled={loading}
            style={styles.googleButton}
            contentStyle={styles.googleButtonContent}
            labelStyle={styles.googleLabel}
            buttonColor={colors.primary}
            textColor={colors.onPrimary}
            icon={({size, color}) => (
              <Icon name="google" size={size} color={color} />
            )}
          >
            Masuk dengan Google
          </Button>

          {!!error && (
            <Text
              variant="labelSmall"
              style={[styles.errorText, {color: colors.error}]}
            >
              {error}
            </Text>
          )}

          <Text
            variant="labelSmall"
            style={[styles.footerText, {color: colors.outline}]}
          >
            Login aman dengan Google OAuth 2.0
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
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  textSection: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  actionSection: {
    width: "100%",
    alignItems: "center",
    gap: 8,
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
  errorText: {
    textAlign: "center",
  },
  footerText: {
    opacity: 0.5,
    fontSize: 10,
  },
});
