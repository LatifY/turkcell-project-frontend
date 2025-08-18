import { createSlice } from '@reduxjs/toolkit';

// Load user from localStorage if exists
const loadUserFromStorage = () => {
  try {
    const user = localStorage.getItem('turkcell_user');
    const token = localStorage.getItem('turkcell_token');
    const expiresAt = localStorage.getItem('turkcell_token_expires');
    
    if (user && token && expiresAt) {
      const now = new Date().getTime();
      if (now < parseInt(expiresAt)) {
        return {
          user: JSON.parse(user),
          token: token,
          expiresAt: parseInt(expiresAt)
        };
      } else {
        // Token expired, clear storage
        localStorage.removeItem('turkcell_user');
        localStorage.removeItem('turkcell_token');
        localStorage.removeItem('turkcell_token_expires');
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

const storedAuth = loadUserFromStorage();

const initialState = {
  currentUser: storedAuth?.user || null,
  accessToken: storedAuth?.token || null,
  tokenExpiresAt: storedAuth?.expiresAt || null,
  isLoggedIn: !!storedAuth?.user,
  isLoading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { userId, accessToken, expiresInMs, email, name } = action.payload;
      const expiresAt = new Date().getTime() + expiresInMs;
      
      const user = {
        id: userId,
        email: email,
        name: name || email, // Use name if available, otherwise email
        home_plan: "Fiber 100 Mbps" // Default plan
      };
      
      state.currentUser = user;
      state.accessToken = accessToken;
      state.tokenExpiresAt = expiresAt;
      state.isLoggedIn = true;
      state.isLoading = false;
      state.error = null;
      
      // Save to localStorage
      localStorage.setItem('turkcell_user', JSON.stringify(user));
      localStorage.setItem('turkcell_token', accessToken);
      localStorage.setItem('turkcell_token_expires', expiresAt.toString());
    },
    loginFailure: (state, action) => {
      state.currentUser = null;
      state.accessToken = null;
      state.tokenExpiresAt = null;
      state.isLoggedIn = false;
      state.isLoading = false;
      state.error = action.payload;
    },
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      // After successful registration, auto-login
      const { userId, accessToken, expiresInMs, email, name } = action.payload;
      const expiresAt = new Date().getTime() + expiresInMs;
      
      const user = {
        id: userId,
        email: email,
        name: name || email,
        home_plan: "Fiber 100 Mbps"
      };
      
      state.currentUser = user;
      state.accessToken = accessToken;
      state.tokenExpiresAt = expiresAt;
      state.isLoggedIn = true;
      state.isLoading = false;
      state.error = null;
      
      // Save to localStorage
      localStorage.setItem('turkcell_user', JSON.stringify(user));
      localStorage.setItem('turkcell_token', accessToken);
      localStorage.setItem('turkcell_token_expires', expiresAt.toString());
    },
    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutUser: (state) => {
      state.currentUser = null;
      state.accessToken = null;
      state.tokenExpiresAt = null;
      state.isLoggedIn = false;
      state.isLoading = false;
      state.error = null;
      
      // Remove from localStorage
      localStorage.removeItem('turkcell_user');
      localStorage.removeItem('turkcell_token');
      localStorage.removeItem('turkcell_token_expires');
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  registerStart, 
  registerSuccess, 
  registerFailure, 
  logoutUser, 
  clearError 
} = userSlice.actions;

export default userSlice.reducer;
