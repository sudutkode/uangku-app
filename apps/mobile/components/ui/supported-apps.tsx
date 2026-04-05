import {SUPPORTED_APPS_CATEGORIZED} from "@/constants/supported-apps";
import React from "react";
import {StyleSheet, View} from "react-native";
import {Divider, Text, useTheme} from "react-native-paper";

export default function SupportedApps() {
  const {colors} = useTheme();

  return (
    <View
      style={[styles.container, {backgroundColor: colors.elevation.level2}]}
    >
      <Text variant="titleSmall" style={styles.title}>
        Aplikasi yang Didukung
      </Text>

      {SUPPORTED_APPS_CATEGORIZED.map((group, groupIndex) => (
        <View key={groupIndex} style={styles.categoryContainer}>
          <Text
            variant="labelMedium"
            style={{color: colors.primary, marginBottom: 8}}
          >
            {group.category}
          </Text>
          <View style={styles.columnContainer}>
            {group.apps.map((app, appIndex) => (
              <Text
                key={appIndex}
                variant="bodySmall"
                style={[styles.appItem, {color: colors.onSurfaceVariant}]}
                numberOfLines={1}
              >
                • {app}
              </Text>
            ))}
          </View>
          {groupIndex < SUPPORTED_APPS_CATEGORIZED.length - 1 && (
            <Divider style={{marginTop: 12}} />
          )}
        </View>
      ))}

      <Text
        variant="labelSmall"
        style={[styles.disclaimer, {color: colors.onSurfaceVariant}]}
      >
        Kami tidak menyimpan kredensial atau informasi pembayaranmu.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontWeight: "600",
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  columnContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  appItem: {
    width: "33.333%",
    paddingVertical: 3,
    fontSize: 11,
  },
  disclaimer: {
    marginTop: 12,
    fontStyle: "italic",
  },
});
