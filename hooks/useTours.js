import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTours } from "../redux/slices/toursSlice.js";

export const useTours = () => {
  const dispatch = useDispatch();
  const { data, loading, error, fetched } = useSelector((state) => state.tours);

  useEffect(() => {
    if (!fetched) {
      dispatch(fetchAllTours());
    }
  }, [fetched, dispatch]);

  return { tours: data, loading, error };
};
