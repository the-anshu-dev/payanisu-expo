import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import tourReducer from "./slices/tourSlice";
import bookingReducer from "./slices/bookingSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    tour: tourReducer,
    booking: bookingReducer,
  },
});

export default store;
