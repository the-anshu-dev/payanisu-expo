import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  checkPoints: [],
};

const tourSlice = createSlice({
  name: "checkPoints",
  initialState,
  reducers: {
    setCheckPoints: (state, action) => {
      state.checkPoints = action.payload;
    },
  },
});

export const { setCheckPoints } = tourSlice.actions;

export default tourSlice.reducer;
