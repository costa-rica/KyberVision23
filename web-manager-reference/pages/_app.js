import "../styles/globals.css";
import Head from "next/head";

import { Provider } from "react-redux";
import user from "../reducers/user";
import { persistStore, persistReducer } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import storage from "redux-persist/lib/storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

const reducers = combineReducers({ user });

const persistConfig = { key: "kyber-vision-web-manager", storage };
const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
const persistor = persistStore(store);

function App({ Component, pageProps }) {
  return (
    <>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <Head>
            <title>KV API22 Manager</title>
            <meta property="og:title" content="K V API22 Manager" />
            <meta
              property="og:description"
              content="KV website to assist with the mobile and mobile API development"
            />
            <meta
              property="og:image"
              content="https://kv22-manager.dashanddata.com/images/KyberV2Shiny.png"
            />
          </Head>
          <Component {...pageProps} />
        </PersistGate>
      </Provider>
    </>
  );
}

export default App;
