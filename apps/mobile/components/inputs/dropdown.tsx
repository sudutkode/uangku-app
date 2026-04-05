import type {FC} from "react";
import {
  Dropdown as PaperDropdown,
  type DropdownProps as PaperDropdownProps,
} from "react-native-paper-dropdown";

const Dropdown: FC<PaperDropdownProps> = (props) => {
  return <PaperDropdown mode="outlined" {...props} />;
};

export default Dropdown;
