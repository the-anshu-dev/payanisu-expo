import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mapLink: "",
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setMapLink: (state, action) => {
      state.mapLink = action.payload;
    },
  },
});

export const { setMapLink } = mapSlice.actions;

export default mapSlice.reducer;
