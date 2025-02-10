import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import tourReducer from "./slices/tourSlice";
import bookingReducer from "./slices/bookingSlice";
import mapReducer from "./slices/mapSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    tour: tourReducer,
    booking: bookingReducer,
    map: mapReducer,
  },
});

export default store;
