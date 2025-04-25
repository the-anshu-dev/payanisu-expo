import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchMembers = createAsyncThunk(
  'members/fetchMembers',
  async (email, thunkAPI) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/get-member?email=${email}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to fetch members');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const membersSlice = createSlice({
  name: 'members',
  initialState: {
    members: [],
    loading: false,
    error: null,
    fetched: false,
  },
  reducers: {
    setMembers: (state, action) => {
      state.members = action.payload;
      state.fetched = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
        state.fetched = true;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setMembers } = membersSlice.actions;
export default membersSlice.reducer;
