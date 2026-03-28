import type {FC} from "react";
import {DatePickerInput} from "react-native-paper-dates";
import {DatePickerInputProps} from "react-native-paper-dates/lib/typescript/Date/DatePickerInput.shared";

type OptionalProps = "locale" | "inputMode" | "mode";

export interface DatePickerProps extends Omit<
  DatePickerInputProps,
  OptionalProps
> {
  locale?: string;
  inputMode?: "start" | "end";
}

const DatePicker: FC<DatePickerProps> = ({
  locale = "id",
  inputMode = "start",
  ...props
}) => {
  return (
    <DatePickerInput
      {...props}
      locale={locale}
      inputMode={inputMode}
      mode="outlined"
    />
  );
};

export default DatePicker;
