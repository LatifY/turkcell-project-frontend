import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  trips: [],
  currentTrip: null,
  homeCountry: 'TR' // Default to Turkey
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    addTrip: (state, action) => {
      const newTrip = {
        id: Date.now(),
        order: state.trips.length,
        ...action.payload,
        createdAt: new Date().toISOString()
      };
      state.trips.push(newTrip);
    },
    removeTrip: (state, action) => {
      state.trips = state.trips.filter(trip => trip.id !== action.payload);
      // Reorder remaining trips
      state.trips.forEach((trip, index) => {
        trip.order = index;
      });
    },
    updateTrip: (state, action) => {
      const { id, ...updates } = action.payload;
      const tripIndex = state.trips.findIndex(trip => trip.id === id);
      if (tripIndex !== -1) {
        state.trips[tripIndex] = { ...state.trips[tripIndex], ...updates };
      }
    },
    reorderTrips: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [removed] = state.trips.splice(sourceIndex, 1);
      state.trips.splice(destinationIndex, 0, removed);
      
      // Update order property
      state.trips.forEach((trip, index) => {
        trip.order = index;
      });
    },
    setCurrentTrip: (state, action) => {
      state.currentTrip = action.payload;
    },
    setHomeCountry: (state, action) => {
      state.homeCountry = action.payload;
    },
    clearTrips: (state) => {
      state.trips = [];
      state.currentTrip = null;
    }
  }
});

export const { 
  addTrip, 
  removeTrip, 
  updateTrip, 
  reorderTrips, 
  setCurrentTrip, 
  setHomeCountry, 
  clearTrips 
} = tripSlice.actions;
export default tripSlice.reducer;
