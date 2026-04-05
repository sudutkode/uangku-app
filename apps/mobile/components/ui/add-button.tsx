import {useRouter} from "expo-router";
import {type FC} from "react";
import {IconButton, useTheme} from "react-native-paper";

interface AddButtonProps {
  screenName: "transactions" | "wallets";
}

const AddButton: FC<AddButtonProps> = ({screenName}) => {
  const router = useRouter();
  const {colors} = useTheme();

  const handlePress = () => {
    router.push(`/${screenName}/add`);
  };

  return (
    <IconButton
      icon="plus"
      containerColor={colors.primary}
      iconColor={colors.surface}
      style={{position: "absolute", bottom: 16, right: 16}}
      size={32}
      onPress={handlePress}
    />
  );
};
export default AddButton;
