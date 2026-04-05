import {format} from "date-fns";
import {id} from "date-fns/locale";
import React, {useState} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {IconButton, Text, useTheme} from "react-native-paper";
import {DatePickerModal} from "react-native-paper-dates";

interface DateStepperProps {
  date: Date;
  onChange: (date: Date) => void;
  mode?: "day" | "month";
}

export default function DateStepper({
  date,
  onChange,
  mode = "day",
}: DateStepperProps) {
  const {colors} = useTheme();
  const [open, setOpen] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                                  NAVIGATION                                */
  /* -------------------------------------------------------------------------- */

  const handlePrev = () => {
    const newDate = new Date(date);

    if (mode === "month") {
      newDate.setMonth(date.getMonth() - 1);
    } else {
      newDate.setDate(date.getDate() - 1);
    }

    onChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(date);

    if (mode === "month") {
      newDate.setMonth(date.getMonth() + 1);
    } else {
      newDate.setDate(date.getDate() + 1);
    }

    onChange(newDate);
  };

  /* -------------------------------------------------------------------------- */
  /*                                  FORMAT TEXT                               */
  /* -------------------------------------------------------------------------- */

  const formattedDate =
    mode === "month"
      ? format(date, "MMMM yyyy", {locale: id})
      : format(date, "EEEE, dd MMM yyyy", {locale: id});

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      <IconButton
        icon="chevron-left"
        size={20}
        onPress={handlePrev}
        iconColor={colors.primary}
      />

      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.dateDisplay}
      >
        <Text
          variant="titleSmall"
          style={{color: colors.onSurface, fontWeight: "600"}}
        >
          {formattedDate}
        </Text>
      </TouchableOpacity>

      <IconButton
        icon="chevron-right"
        size={20}
        onPress={handleNext}
        iconColor={colors.primary}
      />

      <DatePickerModal
        locale="id"
        mode="single"
        visible={open}
        onDismiss={() => setOpen(false)}
        date={date}
        onConfirm={(params) => {
          setOpen(false);
          if (params.date) onChange(params.date);
        }}
        validRange={
          mode === "month"
            ? {
                startDate: new Date(2000, 0, 1),
                endDate: new Date(2100, 11, 31),
              }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  dateDisplay: {
    flex: 1,
    alignItems: "center",
  },
});
