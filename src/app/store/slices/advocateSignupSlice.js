import { createSlice } from "@reduxjs/toolkit";

/* =========================================================================
   ADVOCATE SIGNUP SLICE

   Temporary state for the multi-step advocate signup wizard. Reconstructed to
   match exactly what hooks/useAdvocateSignup.js imports:

     setAdvocateData    (action creator / thunk)
     patchAdvocateData  (action creator)
     resetAdvocateSignup(action creator)
     selectAdvocateData (selector)
     default export     (reducer)

   Persistence is sessionStorage, inlined here so this file has no dependency
   on another module. It survives a refresh during signup and is cleared the
   moment registration completes — it is never used for authentication.
   ========================================================================= */

const STORAGE_KEY = "vakeel_setu_advocate_signup";

const hasSessionStorage = () =>
  typeof window !== "undefined" &&
  typeof window.sessionStorage !== "undefined";

const readStoredData = () => {
  if (!hasSessionStorage()) return {};

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};

const writeStoredData = (data) => {
  if (!hasSessionStorage()) return;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* Quota or privacy mode — the wizard still works from Redux alone. */
  }
};

const clearStoredData = () => {
  if (!hasSessionStorage()) return;

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
};

const initialState = {
  advocateData: readStoredData(),
};

const advocateSignupSlice = createSlice({
  name: "advocateSignup",

  initialState,

  reducers: {
    /* Replaces the whole object. */
    advocateDataSet: (state, action) => {
      const next =
        action.payload && typeof action.payload === "object"
          ? action.payload
          : {};

      state.advocateData = next;
      writeStoredData(next);
    },

    /* Shallow-merges a partial update. */
    advocateDataPatched: (state, action) => {
      if (!action.payload || typeof action.payload !== "object") return;

      const next = { ...state.advocateData, ...action.payload };

      state.advocateData = next;
      writeStoredData(next);
    },

    advocateSignupReset: (state) => {
      state.advocateData = {};
      clearStoredData();
    },
  },
});

const { advocateDataSet, advocateDataPatched, advocateSignupReset } =
  advocateSignupSlice.actions;

/**
 * Drop-in replacement for the old Context setter.
 *
 * The previous AdvocateSignupContext held this in useState, so components may
 * well call it React-style with an updater function:
 *
 *   setAdvocateData((previous) => ({ ...previous, gender: "Male" }))
 *
 * A plain action creator would put that function into the action payload,
 * which Redux can't serialise. This thunk resolves the function against
 * current state first, so both call styles work.
 */
export const setAdvocateData = (nextValue) => (dispatch, getState) => {
  const current = getState().advocateSignup?.advocateData || {};

  const resolved =
    typeof nextValue === "function" ? nextValue(current) : nextValue;

  dispatch(advocateDataSet(resolved));

  return resolved;
};

export const patchAdvocateData = (partialValue) =>
  advocateDataPatched(partialValue);

export const resetAdvocateSignup = () => advocateSignupReset();

export const selectAdvocateSignup = (state) => state.advocateSignup;

export const selectAdvocateData = (state) =>
  state.advocateSignup.advocateData;

export default advocateSignupSlice.reducer;