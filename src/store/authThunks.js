import { createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../services/api';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  registerStart, 
  registerSuccess, 
  registerFailure 
} from './userSlice';

// Login thunk
export const loginUserAsync = createAsyncThunk(
  'user/loginAsync',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart());
      const response = await ApiService.login(credentials);
      
      const responseWithUserData = {
        ...response,
        email: credentials.email,
        name: credentials.name || credentials.email
      };
      
      dispatch(loginSuccess(responseWithUserData));
      return responseWithUserData;
    } catch (error) {
      const errorMessage = error.message || 'Giriş yapılırken bir hata oluştu';
      dispatch(loginFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Register thunk
export const registerUserAsync = createAsyncThunk(
  'user/registerAsync',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(registerStart());
      const response = await ApiService.register(userData);
      
      const responseWithUserData = {
        ...response,
        email: userData.email,
        name: userData.name
      };
      
      dispatch(registerSuccess(responseWithUserData));
      return responseWithUserData;
    } catch (error) {
      const errorMessage = error.message || 'Kayıt olurken bir hata oluştu';
      dispatch(registerFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);
