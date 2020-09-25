# Ruffle

Ruffle is an opinionated wrapper for Redux-React, Redux-Toolkit and Axios that makes calling an asynchronous API and updating your Redux store a breeze.

## TLDR;
Get rid of Redux and API boilerplate code.

` /store/slices/truck.js`
```javascript
  import { createSlice } from '@reduxjs/toolkit';
  import { Ruffle } from '../ruffle-redux';

  // slice constants
  const sliceName = 'truck';

  // slice actions
  export const createTruckAction = Ruffle.create(sliceName);
  export const getTrucksAction = Ruffle.getMany(sliceName);
  export const getTruckAction = Ruffle.getOne(sliceName);

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
        state.allTrucks` = action.payload.data;
      },
      [getTruckAction.fulfilled]: (state, action) => {
        Ruffle.throwIfError(action);
        state.truck = action.payload.data;
      }
  });

  Ruffle.registerSlice(sliceName, reduxStore => {
    Ruffle.registerReducer(reduxStore, sliceName, truckSlice);
    Ruffle.addWebsocketListener(reduxStore, sliceName, getTrucksAction, getTruckAction);
  });
```

` /api/truck.js`

```javascript
  import { REST } from './ruffle-api';

  export default () => ({
    ...REST('trucks')
  });
```


## Motivation

In my early React projects I had always used Flux as my data store.  I hated it, it was so verbose and made server calls a pain in the butt.  Soooooooo much boilerplate code!

On my more recent projects, I started using Redux and liked the reduction in boilerplate code and the intuitive way it updated the store and triggered re-renders.  However, I still thought it was too much boilerplate code.  Why do I need to define String constants everywhere for Actions?  My quest to reduce boilerplate code had to continue.

I then found Redux-Toolkit and thought "time to delete some code!".  And it was true, I was able to reduce my Redux code greatly.  But my brain was still set on "reduce code, reduce code, reduce code" mode, so my quest had to continue.

The result of my quest is presented to you here with Ruffle.  It's a wrapper for Redux-toolkit that gets rid of additional boilerplate code and makes sure every line of code you write in your store is meaningful.

But wait, there's more...since Redux can be so tightly coupled with async API calls, why not add some additional functionality to tie the API layer into Ruffle as well!

The result is a toolkit I hope you all find helpful to get your Redux Store and API layer up and running almost instantly.

(If you're not familiar with Redux or the terms used in Redux ("slice" for example), please read-up using the [Redux docs](https://react-redux.js.org/).

## Setting up Your Project
Since Ruffle is an opinionated solution, it makes certain assumptions about your project folder structure to automagically wire everything together.

**API folder**
Required: Your API files should in the folder `/api` with a file called `index.js` that exports all the individual API files.

Example
`/api/index.js`
	import truck from './truck';
		
  export default {
		truck: truck()
	}

**API file**
Recommendation: Each endpoint group should be in its own file, for example `/api/truck.js`

**Store folder**
Recommendation: Put your Redux set-up files in a folder called `/store`

**Slices folder**
Recommendation: Put your individual slice files in a folder within the Store folder, for example `/store/slices`

**Slice file**
Recommendation: Call each individual slice file the same as the slice name.  For example, the `truck` slice should be defined within the `/store/slices/truck.js` file.

## Creating a Slice
Ruffle makes creating a slice easy by building on the existing Redux-Toolkit's `createSlice()` function.  For slices that make API calls though, Ruffle adds functionality to integrate the Redux-Toolkit's `createAsyncThunk()`

`export const createTruckAction = Ruffle.async(sliceName, 'createTruck');`

When this is called using a dispatch like this:
`dispatch(createTruckAction(params))`

it will call
`createTruck()` in the `/api/truck` file.

And the response will reduced in the code in your slice definition

```javascript
  [createTruckAction.fulfilled]: (state, action) => {
      Ruffle.throwIfError(action);
      state.truck = action.payload.data;
      state.allTrucks.push(action.payload.data);
    },
```


## Registering Your Slice

```javascript
  Ruffle.registerSlice(sliceName, reduxStore => {
    Ruffle.registerReducer(reduxStore, sliceName, truckSlice);
  });
```

## Redux setup

Since your reducers are all registering themselves upon creation, your redux set up file can be simplified.
You only need to call `Ruffle.configureSlices(reduxStore)` when your Redux is set up.

```javascript
  const reducer = combineReducers({});

  const reduxStore = configureStore({
    reducer,
    middleware,
    devTools: process.env.NODE_ENV !== 'production'
  });

Ruffle.configureSlices(reduxStore);
```

## API REST Helper

```javascript
  export default () => ({
    ...REST('trucks')
  });
```


## Tying the Slice to API REST Calls
  `export const createTruckAction = Ruffle.create(sliceName);`

which will automatically call
`create()`

with the path `trucks`

From the `REST` function in ruffle-api.js


## Tying it to WebSockets

```javascript
  Ruffle.registerSlice(sliceName, reduxStore => {
    Ruffle.registerReducer(reduxStore, sliceName, truckSlice);
    Ruffle.addWebsocketListener(reduxStore, sliceName, getTrucksAction, getTruckAction);
  });
```

Sending a message over websockets with the data structure of:
```javascript
  {
    type: "truck",
    id: "12345"
  }
```

And calling this function when the message is received 
  `Ruffle.fireMessageReceived(message)`

Will parse the message into JSON, determine the slice to operate on (truck in this example), and look for an `id` field.
If there's an `id` field, it will call GET /trucks/:id
If there's no `id` field, it will call GET /trucks

## What Else is Coming?
- Tighter integration with WebPack to automatically update /stores/slices/index.js when a new slice file is created
- Tighter integration with WebPack to automatically update /api/index.js when a new api file is created
- Better integration with Websockets, so the server can pass the object directly in the message without forcing a request to the server
- Integration with popular 3rd party API tools like Cognito
