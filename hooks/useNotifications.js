import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showError } from "../utils/toastHelper";
import { fetchNotifications } from "../redux/slices/notificationsSlice";

export const useNotifications = (email, forceRefresh = false) => {
  const dispatch = useDispatch();
  const { all, loading, error, fetched } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    if (email && (!fetched || forceRefresh)) {
      dispatch(fetchNotifications(email));
    } else if (!email) {
      showError("User email is not available.");
    }
  }, [email, fetched, forceRefresh]);

  return { notifications: all, loading, error };
};
