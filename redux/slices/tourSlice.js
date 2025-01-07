import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tour: [],
  bookedTour: [],
  checkPoints: [],
};

const tourSlice = createSlice({
  name: "tour",
  initialState,
  reducers: {
    setTour: (state, action) => {
      state.tour = action.payload;
    },
    setBookedTour: (state, action) => {
      state.bookedTour = action.payload;
    },
    setCheckPoints: (state, action) => {
      state.checkPoints = action.payload;
    },
  },
});

export const { setTour, setBookedTour, setCheckPoints } = tourSlice.actions;

export default tourSlice.reducer;
