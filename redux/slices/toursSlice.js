import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchAllTours = createAsyncThunk(
  "tours/fetchAllTours",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/get-alltours`
      );
      const data = await response.json();
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const toursSlice = createSlice({
  name: "tours",
  initialState: {
    data: [],
    loading: false,
    error: null,
    fetched: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTours.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.fetched = true;
      })
      .addCase(fetchAllTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default toursSlice.reducer;
