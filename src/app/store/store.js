import {
  configureStore,
} from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import advocateSignupReducer from "./slices/advocateSignupSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    advocateSignup:
      advocateSignupReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        /**
         * `photo` may temporarily contain a File/Blob while the
         * advocate signup form is open.
         *
         * We allow that one path for backwards compatibility with
         * the old Context implementation. The persistence layer
         * deliberately excludes raw File/Blob values from
         * sessionStorage.
         */
        ignoredPaths: [
          "advocateSignup.advocateData.photo",
        ],

        ignoredActions: [
          "advocateSignup/advocateDataReplaced",
          "advocateSignup/advocateDataPatched",
        ],
      },
    }),

  devTools:
    import.meta.env.DEV,
});

export default store;

if (import.meta.env.DEV && typeof window !== "undefined") {
  window.__APP_STORE__ = store;
}
