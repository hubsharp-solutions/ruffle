import { createSlice } from '@reduxjs/toolkit';
import { Ruffle } from '../ruffle-redux';

// slice constants
const sliceName = 'truck';

// slice actions
export const createTruckAction = Ruffle.create(sliceName);
export const getTrucksAction = Ruffle.getMany(sliceName);
export const getTruckAction = Ruffle.getOne(sliceName);
export const deleteTruckAction = Ruffle.delete(sliceName);
export const updateTruckAction = Ruffle.update(sliceName);

// slice reducers
export const truckSlice = createSlice({
  name: sliceName,
  initialState: { allTrucks: [], truck: {} },
  reducers: {},
  extraReducers: {
    [createTruckAction.fulfilled]: (state, action) => {
      Ruffle.throwIfError(action);
      state.truck = action.payload.data;
      state.allTrucks.push(action.payload.data);
    },
    [getTrucksAction.fulfilled]: (state, action) => {
      Ruffle.throwIfError(action);
      state.allTrucks = action.payload.data;
    },
    [getTruckAction.fulfilled]: (state, action) => {
      Ruffle.throwIfError(action);
      state.truck = action.payload.data;
    },
    [deleteTruckAction.fulfilled]: (state, action) => {
      Ruffle.throwIfError(action);
      state.allTrucks = state.allTrucks.filter(t => {
        return t.id !== action.payload.data.id;
      });
    },
    [updateTruckAction.fulfilled]: (state, action) => {
      Ruffle.throwIfError(action);
      state.truck = action.payload.data.updated;
    }
  }
});

Ruffle.registerSlice(sliceName, reduxStore => {
  Ruffle.registerReducer(reduxStore, sliceName, truckSlice);
  Ruffle.addWebsocketListener(reduxStore, sliceName, getTrucksAction, getTruckAction);
});
