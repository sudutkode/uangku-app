import type {FC} from "react";
import React from "react";
import {StyleProp, TouchableOpacity} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<any>;
  onPress?: () => void;
}

const Icon: FC<IconProps> = ({
  name,
  size = 24,
  color = "#ffffff",
  onPress,
  style,
}) => {
  const IconElement = (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      style={style ? style : undefined}
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {IconElement}
      </TouchableOpacity>
    );
  }

  return IconElement;
};

export default Icon;
