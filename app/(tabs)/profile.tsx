import {useAuthStore} from "@/store";
import {screenHeight} from "@/utils/common-utils";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {format} from "date-fns";
import React from "react";
import {StyleSheet, View} from "react-native";
import {Avatar, Button, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

export default function ProfileScreen() {
  const {colors} = useTheme();
  const {signout, user} = useAuthStore();

  const handleSignOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      signout();
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
    >
      <View style={styles.header}>
        <Avatar.Image
          size={100}
          source={{uri: user?.avatar}}
          style={styles.avatar}
        />
        <Text variant="headlineSmall" style={styles.userName}>
          {user?.name}
        </Text>
        <Text variant="bodyMedium" style={{color: colors.outline}}>
          {user?.email}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text variant="labelLarge">Joined Since</Text>
        <Text variant="bodyMedium">
          {user?.createdAt ? format(user.createdAt, "dd MMM yyyy") : "-"}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          mode="text"
          onPress={handleSignOut}
          textColor={colors.error}
          icon="logout"
          style={styles.signOutButton}
        >
          Sign Out
        </Button>
        <Text
          variant="labelSmall"
          style={[styles.versionText, {color: colors.outline}]}
        >
          Versi 1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: screenHeight * 0.025,
    marginBottom: 32,
  },
  avatar: {
    marginBottom: 16,
    elevation: 4,
  },
  userName: {
    fontWeight: "700",
    textAlign: "center",
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
  },
  signOutButton: {
    width: "100%",
  },
  versionText: {
    marginTop: 4,
    letterSpacing: 1,
  },
});
