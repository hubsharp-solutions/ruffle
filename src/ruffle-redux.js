import { combineReducers } from 'redux';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/index';

export const Ruffle = {
  create: sliceName => Ruffle.async(sliceName, 'create'),
  getMany: sliceName => Ruffle.async(sliceName, 'getMany'),
  getOne: sliceName => Ruffle.async(sliceName, 'getOne'),
  delete: sliceName => Ruffle.async(sliceName, 'delete'),
  update: sliceName => Ruffle.async(sliceName, 'update'),
  patch: sliceName => Ruffle.async(sliceName, 'patch'),
  async: (sliceName, eventName) => {
    return createAsyncThunk(`${sliceName}/${eventName}`, async (params, thunkAPI) => {
      try {
        const response = await api[sliceName][eventName](params);
        return response;
      } 
      catch (err) {
        const errorResponse = {
          status: err.response.status,
          errorMessage: err.response.statusText,
          details: err.response.data.details ? err.response.data.details : err.response.data
        };
        return errorResponse;
      }
    });
  },
  unwrapAsyncResponse: response => {
    return { ...response.payload.data };
  },
  throwIfError: action => {
    if (action && action.payload && action.payload.errorMessage && Object.keys(action.payload.errorMessage).length > 0) {
      throw action.payload;
    }
  },

  // functions to allow each slice to self-register as a reducer with the reduxStore
  registeredSlices: {},
  registerSlice: (sliceName, cb) => {
    console.log('Registering slice', sliceName);
    Ruffle.registeredSlices[sliceName] = cb;
  },
  configureSlices: reduxStore => {
    Object.keys(Ruffle.registeredSlices).forEach(key => {
      Ruffle.registeredSlices[key](reduxStore);
    });
  },
  registerReducer: (reduxStore, sliceName, slice) => {
    if (typeof reduxStore.currentReducers === 'undefined') {
      reduxStore.currentReducers = {};
    }
    if (sliceName in reduxStore.currentReducers === false) {
      reduxStore.currentReducers[sliceName] = slice.reducer;
      reduxStore.replaceReducer(combineReducers(reduxStore.currentReducers));
    }
  },

  // functions for working with websockets
  websocketListeners: [],
  addWebsocketListener: (store, sliceName, getOne, getMany) => {
    Ruffle.websocketListeners[sliceName] = { store, getOne, getMany };
  },
  fireMessageReceived: message => {
    const data = JSON.parse(message);
    const { store, getOne, getMany } = Ruffle.websocketListeners[data.type];
    if (data.id) {
      store.dispatch(getOne({ id: data.id }));
    } else {
      store.dispatch(getMany());
    }
  },

  // logging utility
  configureLogger: (getState, action) => {
    if (action.type && action.type.indexOf('fulfilled') > -1) {
      const sliceName = action.type.substring(0, action.type.indexOf('/'));
      console.group(action.type);
      console.log('Updated slice', getState()[sliceName]);
      console.log('Updated store', getState());
      console.groupEnd();
    }
  }
};