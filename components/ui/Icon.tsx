import type {FC} from "react";
import React from "react";
import {StyleProp, TouchableOpacity} from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<any>;
  onPress?: () => void;
}

const Icon: FC<IconProps> = ({
  name,
  size = 20,
  color = "#ffffff",
  onPress,
  style,
}) => {
  const IconElement = (
    <FontAwesome6
      name={name}
      size={size}
      color={color}
      style={style ? style : undefined}
      solid
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
