import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tourMembers: [],
  totalCost: 0,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setTourMembers: (state, action) => {
      state.tourMembers = action.payload;
    },
    setTotalCost: (state, action) => {
      state.totalCost = action.payload;
    },
  },
});

export const { setTourMembers, setTotalCost } = bookingSlice.actions;

export default bookingSlice.reducer;
