import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const fetchBookedTours = createAsyncThunk(
  "bookedTours/fetchBookedTours",
  async (email, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/get-my-tour?email=${email}`
      );

      if (!res.ok) throw new Error("Failed to fetch booked tours");

      const { data } = await res.json();
      await AsyncStorage.setItem("bookedTours", JSON.stringify(data));
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Please try again.");
    }
  }
);

const bookedToursSlice = createSlice({
  name: "bookedTours",
  initialState: {
    bookedTours: [],
    loading: false,
    error: null,
  },
  reducers: {
    setBookedTour: (state, action) => {
      state.bookedTours = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookedTours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookedTours.fulfilled, (state, action) => {
        state.loading = false;
        state.bookedTours = action.payload;
      })
      .addCase(fetchBookedTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setBookedTour } = bookedToursSlice.actions;
export default bookedToursSlice.reducer;
