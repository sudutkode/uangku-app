import {type FC} from "react";
import {StyleSheet, View} from "react-native";
import {Button, Dialog, DialogProps, Text, useTheme} from "react-native-paper";

interface ConfirmationDialogProps extends Omit<DialogProps, "children"> {
  title: string;
  content: string;
  handleConfirm: () => void;
  withAlert?: boolean;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  title,
  content,
  handleConfirm,
  withAlert,
  confirmText = "Ya",
  cancelText = "Batal",
  isDestructive = false,
  ...props
}) => {
  const {colors} = useTheme();

  return (
    <Dialog {...props} style={[styles.dialog, props.style]}>
      {withAlert && (
        <View style={styles.iconWrapper}>
          <Dialog.Icon
            icon="alert"
            size={40}
            color={isDestructive ? colors.error : colors.primary}
          />
        </View>
      )}
      <Dialog.Title style={styles.title}>{title}</Dialog.Title>
      <Dialog.Content style={styles.content}>
        <Text
          variant="bodyMedium"
          style={[styles.contentText, {color: colors.onSurfaceVariant}]}
        >
          {content}
        </Text>
      </Dialog.Content>
      <Dialog.Actions style={styles.actions}>
        <Button mode="outlined" style={styles.button} onPress={props.onDismiss}>
          {cancelText}
        </Button>
        <Button
          mode="contained-tonal"
          buttonColor={
            isDestructive ? colors.errorContainer : colors.primaryContainer
          }
          textColor={isDestructive ? colors.error : colors.primary}
          style={styles.button}
          onPress={handleConfirm}
        >
          {confirmText}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 28,
    paddingBottom: 8,
  },
  iconWrapper: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 4,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    paddingTop: 4,
  },
  contentText: {
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  button: {
    flex: 1,
    borderRadius: 50,
  },
});

export default ConfirmationDialog;
