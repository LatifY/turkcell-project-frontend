import { createSlice } from '@reduxjs/toolkit';
import defaultProfile from '../data/profiles';

const initialState = {
  userProfiles: {} // userId -> profile mapping
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      const { userId, profile } = action.payload;
      state.userProfiles[userId] = profile;
      // Save to localStorage
      localStorage.setItem('turkcell_profiles', JSON.stringify(state.userProfiles));
    },
    loadUserProfiles: (state) => {
      try {
        const saved = localStorage.getItem('turkcell_profiles');
        if (saved) {
          state.userProfiles = JSON.parse(saved);
        }
      } catch (error) {
        console.error('Error loading profiles:', error);
      }
    },
    getUserProfile: (state, action) => {
      const userId = action.payload;
      return state.userProfiles[userId] || defaultProfile;
    }
  }
});

export const { setUserProfile, loadUserProfiles, getUserProfile } = profileSlice.actions;
export default profileSlice.reducer;
