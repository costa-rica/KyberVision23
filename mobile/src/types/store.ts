import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "@reduxjs/toolkit";
import user from "../reducers/user";
import team from "../reducers/team";
import script from "../reducers/script";
import review from "../reducers/review";
import upload from "../reducers/upload";
import sync from "../reducers/sync";

// Persist config for user only
const userPersistConfig = {
  key: "user",
  storage: AsyncStorage,
};

// Root reducer combining all reducers
const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, user), // persisted
  team, // not persisted
  script, // not persisted
  review, // not persisted
  upload, // not persisted
  sync, // not persisted
  // Add other reducers here as needed
});

// Create store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;