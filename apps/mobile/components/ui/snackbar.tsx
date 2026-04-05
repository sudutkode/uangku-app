import React, {FC} from "react";
import {StyleSheet} from "react-native";
import {Snackbar as PaperSnackbar, Text, useTheme} from "react-native-paper";

interface SnackbarProps {
  visible: boolean;
  onDismiss: () => void;
  text: string;
}

const Snackbar: FC<SnackbarProps> = ({visible, text, onDismiss}) => {
  const {colors} = useTheme();

  return (
    <PaperSnackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={3000}
      style={{backgroundColor: colors.errorContainer, borderRadius: 8}}
      wrapperStyle={styles.wrapper}
    >
      <Text variant="bodySmall" style={{color: colors.onErrorContainer}}>
        {text}
      </Text>
    </PaperSnackbar>
  );
};

export default Snackbar;

const styles = StyleSheet.create({
  wrapper: {
    top: 8,
    right: 8,
    left: "auto",
    width: "80%",
    alignItems: "flex-end",
  },
});
