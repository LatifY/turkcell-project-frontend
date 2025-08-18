import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import tripReducer from './tripSlice';
import profileReducer from './profileSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    trip: tripReducer,
    profile: profileReducer,
  },
});

export default store;
