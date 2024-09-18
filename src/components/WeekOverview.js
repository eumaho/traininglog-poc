import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Box, Badge } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker, PickersDay } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Custom theme to remove OK and CANCEL buttons
const THEME = createTheme({
  components: {
    MuiDialogActions: {
      styleOverrides: {
        root: {
          display: 'none', // Hides the OK/Cancel buttons
        },
      },
    },
  },
});

// Custom day renderer to add badges for days with activities
const CustomDay = (props) => {
  const { day, outsideCurrentMonth, highlightedDays, ...other } = props;

  const isSelected =
    !outsideCurrentMonth && highlightedDays.includes(day.format("YYYY-MM-DD"));

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={isSelected ? "•" : null} // Display a dot or any other content
      color="primary" // Green badge for days with activities
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
};

const WeekOverview = ({ onDayClick, trainingData }) => {
  const today = dayjs();
  const [highlightedDays, setHighlightedDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(today); // Use state to control the selected date

  useEffect(() => {
    const newHighlightedDays = [];

    // Assuming trainingData contains a structure like:
    // { 'YYYY-MM-DD': [{ activityName, duration }, ...] }
    Object.keys(trainingData || {}).forEach((day) => {
      newHighlightedDays.push(day);
    });

    setHighlightedDays(newHighlightedDays);
  }, [trainingData]);

  return (
    <ThemeProvider theme={THEME}>
      <Box>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <StaticDatePicker
            localeText={{ toolbarTitle: "Select Date to see activities" }} // Custom label
            value={selectedDay}
            onChange={(newDate) => {
              setSelectedDay(newDate); // Update the selected date in state
              const formattedDate = dayjs(newDate).format("YYYY-MM-DD");
              onDayClick(formattedDate); // Trigger the callback when a day is selected
            }}
            disableHighlightToday={false}
            showToolbar={false} // Disable the toolbar
            slots={{
              day: CustomDay, // Use custom day component
            }}
            slotProps={{
              day: {
                highlightedDays, // Pass highlighted days for training sessions
              },
            }}
            sx={{ transform: "scale(0.7)" }} // Reduce the size by 30%
          />
        </LocalizationProvider>
      </Box>
    </ThemeProvider>
  );
};

export default WeekOverview;
