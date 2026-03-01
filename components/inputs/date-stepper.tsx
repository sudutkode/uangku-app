import {format} from "date-fns"; // disarankan: npm install date-fns
import React, {useState} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {IconButton, Text, useTheme} from "react-native-paper";
import {DatePickerModal} from "react-native-paper-dates";

interface DateStepperProps {
  date: Date;
  onChange: (date: Date) => void;
}

export default function DateStepper({date, onChange}: DateStepperProps) {
  const {colors} = useTheme();
  const [open, setOpen] = useState(false);

  const handlePrev = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    onChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    onChange(newDate);
  };

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
          {format(date, "EEE, dd MMM yyyy")}
        </Text>
      </TouchableOpacity>

      <IconButton
        icon="chevron-right"
        size={20}
        onPress={handleNext}
        iconColor={colors.primary}
      />

      <DatePickerModal
        locale="en"
        mode="single"
        visible={open}
        onDismiss={() => setOpen(false)}
        date={date}
        onConfirm={(params) => {
          setOpen(false);
          if (params.date) onChange(params.date);
        }}
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
