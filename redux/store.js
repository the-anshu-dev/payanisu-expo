import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import checkPointsReducer from "./slices/checkPointsSlice";
import bookingReducer from "./slices/bookingSlice";
import mapReducer from "./slices/mapSlice";
import toursReducer from "./slices/toursSlice";
import membersReducer from "./slices/membersSlice";
import notificationsReducer from "./slices/notificationsSlice";
import postsReducer from "./slices/postsSlice";
import bookedToursReducer from "./slices/bookedToursSlice";
import autoCheckinReducer from "./slices/autoCheckinSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    autoCheckin: autoCheckinReducer,
    checkPoints: checkPointsReducer,
    tours: toursReducer,
    booking: bookingReducer,
    members: membersReducer,
    notifications: notificationsReducer,
    posts: postsReducer,
    bookedTours: bookedToursReducer,
    map: mapReducer,
  },
});

export default store;
