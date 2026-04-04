import {type FC} from "react";
import {Button, Dialog, DialogProps, Text, useTheme} from "react-native-paper";

interface ConfirmationDialogProps extends Omit<DialogProps, "children"> {
  title: string;
  content: string;
  handleConfirm: () => void;
  withAlert?: boolean;
}

const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  title,
  content,
  handleConfirm,
  withAlert,
  ...props
}) => {
  const {colors} = useTheme();

  return (
    <Dialog {...props}>
      {withAlert && <Dialog.Icon icon="alert" size={50} color={colors.error} />}
      <Dialog.Title style={{textAlign: "center"}}>{title}</Dialog.Title>
      <Dialog.Content>
        <Text variant="bodyMedium">{content}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={props.onDismiss}>Batal</Button>
        <Button textColor={colors.error} onPress={handleConfirm}>
          Hapus
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};
export default ConfirmationDialog;
