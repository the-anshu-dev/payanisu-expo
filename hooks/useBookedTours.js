import { useSelector } from "react-redux";

export const useBookedTours = () => {
  const { bookedTours, loading, error } = useSelector(
    (state) => state.bookedTours
  );
  return { bookedTours, loading, error };
};
