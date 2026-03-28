import React, {memo} from "react";
import {StyleSheet, View} from "react-native";
import {ActivityIndicator, Button, Text, useTheme} from "react-native-paper";
import Icon from "./icon-fa6";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoadingStateProps {
  message?: string;
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  onRefetch?: () => void;
}

// ─── Loading ──────────────────────────────────────────────────────────────────

export const LoadingState = memo(
  ({message = "Memuat..."}: LoadingStateProps) => {
    const {colors} = useTheme();
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          variant="bodyMedium"
          style={[styles.message, {color: colors.onSurfaceVariant}]}
        >
          {message}
        </Text>
      </View>
    );
  },
);
LoadingState.displayName = "LoadingState";

// ─── Error ────────────────────────────────────────────────────────────────────

export const ErrorState = memo(
  ({message = "Terjadi kesalahan", onRetry}: ErrorStateProps) => {
    const {colors} = useTheme();
    return (
      <View style={styles.center}>
        <View
          style={[styles.iconWrapper, {backgroundColor: colors.errorContainer}]}
        >
          <Icon name="triangle-exclamation" size={22} color={colors.error} />
        </View>
        <Text
          variant="titleSmall"
          style={[styles.title, {color: colors.onSurface}]}
        >
          {message}
        </Text>
        {onRetry && (
          <Button
            mode="contained-tonal"
            onPress={onRetry}
            style={styles.actionButton}
            compact
          >
            Coba lagi
          </Button>
        )}
      </View>
    );
  },
);
ErrorState.displayName = "ErrorState";

// ─── Empty ────────────────────────────────────────────────────────────────────

export const EmptyState = memo(
  ({icon, title, subtitle, onRefetch}: EmptyStateProps) => {
    const {colors} = useTheme();
    return (
      <View style={styles.center}>
        <View
          style={[styles.iconWrapper, {backgroundColor: colors.surfaceVariant}]}
        >
          <Icon name={icon} size={22} color={colors.onSurfaceVariant} />
        </View>
        <Text
          variant="titleSmall"
          style={[styles.title, {color: colors.onSurface}]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="bodySmall"
            style={[styles.subtitle, {color: colors.onSurfaceVariant}]}
          >
            {subtitle}
          </Text>
        )}
        {onRefetch && (
          <Button
            mode="contained-tonal"
            onPress={onRefetch}
            style={styles.actionButton}
            icon="refresh"
            compact
          >
            Segarkan
          </Button>
        )}
      </View>
    );
  },
);
EmptyState.displayName = "EmptyState";

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 8,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    textAlign: "center",
  },
  message: {
    marginTop: 4,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  actionButton: {
    marginTop: 4,
  },
});
