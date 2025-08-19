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

// login
export const loginUserAsync = createAsyncThunk(
  'user/loginAsync',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart());
      const response = await ApiService.login(credentials);
      
      dispatch(loginSuccess(response));
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Giriş yapılırken bir hata oluştu';
      dispatch(loginFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// register
export const registerUserAsync = createAsyncThunk(
  'user/registerAsync',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(registerStart());
      const response = await ApiService.register(userData);
      
      dispatch(registerSuccess(response));
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Kayıt olurken bir hata oluştu';
      dispatch(registerFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);
