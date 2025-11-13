import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authslice from "./authSlice.js";
import postSlice from "./postSlice.js";
import socketSlice from "./socketSlice.js";
import chatSlice from "./chatSlice.js";
import rtnSlice from "./rtnSlice.js"
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage';


const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  blacklist: ['socketio'], // Don't persist socketio slice
}
 
const rootReducer =combineReducers({
    auth:authslice,
    post:postSlice,
    socketio:socketSlice,
    chat:chatSlice,
    realTimeNotification:rtnSlice
})
const persistedReducer = persistReducer(persistConfig, rootReducer)

const store =configureStore({
   reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, 'socketio/setSocket'],
        ignoredPaths: ['socketio.socket'],
      },
    }),
}); 
export default store;