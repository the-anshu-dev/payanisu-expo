// hooks/usePosts.js

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPosts } from "../redux/slices/postsSlice";

export const usePosts = (forceRefresh = false) => {
  const dispatch = useDispatch();
  const { allPosts, loading, error } = useSelector((state) => state.posts);

  useEffect(() => {
    if (forceRefresh || allPosts.length === 0) {
      dispatch(fetchAllPosts());
    }
  }, [dispatch, forceRefresh]);

  return {
    posts: allPosts,
    loading,
    error,
  };
};
