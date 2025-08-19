import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateToken, logoutUser } from '../store/userSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { currentUser, accessToken, tokenExpiresAt, isLoggedIn } = useSelector(state => state.user);

  // Check token validity on mount and periodically
  useEffect(() => {
    const checkTokenValidity = () => {
      if (accessToken && tokenExpiresAt) {
        const now = new Date().getTime();
        const timeUntilExpiry = tokenExpiresAt - now;
        
        // If token expires in less than 5 minutes, consider it expired
        if (timeUntilExpiry < 5 * 60 * 1000) {
          dispatch(logoutUser());
        }
      }
    };

    // Check immediately
    checkTokenValidity();

    // Check every minute
    const interval = setInterval(checkTokenValidity, 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken, tokenExpiresAt, dispatch]);

  // Validate token on app load
  useEffect(() => {
    dispatch(validateToken());
  }, [dispatch]);

  const logout = () => {
    dispatch(logoutUser());
  };

  const isTokenValid = () => {
    if (!accessToken || !tokenExpiresAt) return false;
    const now = new Date().getTime();
    return now < tokenExpiresAt;
  };

  const getTimeUntilExpiry = () => {
    if (!tokenExpiresAt) return 0;
    const now = new Date().getTime();
    return Math.max(0, tokenExpiresAt - now);
  };

  const getAuthHeaders = () => {
    if (isTokenValid()) {
      return {
        'Authorization': `Bearer ${accessToken}`
      };
    }
    return {};
  };

  return {
    currentUser,
    accessToken,
    isLoggedIn,
    isTokenValid: isTokenValid(),
    timeUntilExpiry: getTimeUntilExpiry(),
    logout,
    getAuthHeaders
  };
};

export default useAuth;
