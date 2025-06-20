// autoCheckinSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  GCheckPoints: null,
  GIsTourCurrentlyActive: null,
  GGeoTaggedCheckPoints: null,
};

const autoCheckinSlice = createSlice({
  name: "autoCheckin",
  initialState,
  reducers: {
    setGCheckPoints: (state, action) => {
      state.GCheckPoints = action.payload;
    },
    setGIsTourCurrentlyActive: (state, action) => {
      state.GIsTourCurrentlyActive = action.payload;
    },
    setGGeoTaggedCheckPoints: (state, action) => {
      state.GGeoTaggedCheckPoints = action.payload;
    },
  },
});

// ✅ Selectors with `G` prefix
export const selectGCheckPoints = (state) => state.autoCheckin.GCheckPoints;
export const selectGIsTourCurrentlyActive = (state) => state.autoCheckin.GIsTourCurrentlyActive;
export const selectGGeoTaggedCheckPoints = (state) => state.autoCheckin.GGeoTaggedCheckPoints;

// ✅ Action exports
export const {
  setGCheckPoints,
  setGIsTourCurrentlyActive,
  setGGeoTaggedCheckPoints,
} = autoCheckinSlice.actions;

export default autoCheckinSlice.reducer;
