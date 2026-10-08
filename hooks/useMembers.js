import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showError } from '../utils/toastHelper';
import { fetchMembers } from '../redux/slices/membersSlice';

export const useMembers = (email) => {
  const dispatch = useDispatch();
  const { members, loading, error, fetched } = useSelector((state) => state.members);

  useEffect(() => {
    if (email && !fetched) {
      dispatch(fetchMembers(email));
    } else if (!email) {
      showError("User email is not available.");
    }
  }, [email, fetched, dispatch]);

  return { members, loading, error };
};
