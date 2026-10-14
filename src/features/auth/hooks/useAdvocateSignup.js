import {
  useCallback,
} from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  patchAdvocateData as patchAdvocateDataAction,
  resetAdvocateSignup as resetAdvocateSignupAction,
  selectAdvocateData,
  setAdvocateData as setAdvocateDataAction,
} from "@app/store/slices/advocateSignupSlice";

/**
 * Redux-backed replacement for the old AdvocateSignupContext hook.
 *
 * Existing API remains:
 *
 * const {
 *   advocateData,
 *   setAdvocateData,
 * } = useAdvocateSignup();
 *
 * Extra helpers are also available:
 * patchAdvocateData()
 * resetAdvocateSignup()
 */
export const useAdvocateSignup = () => {
  const dispatch = useDispatch();

  const advocateData =
    useSelector(selectAdvocateData);

  const setAdvocateData =
    useCallback(
      (nextValue) =>
        dispatch(
          setAdvocateDataAction(
            nextValue,
          ),
        ),
      [dispatch],
    );

  const patchAdvocateData =
    useCallback(
      (partialValue) =>
        dispatch(
          patchAdvocateDataAction(
            partialValue,
          ),
        ),
      [dispatch],
    );

  const resetAdvocateSignup =
    useCallback(
      () =>
        dispatch(
          resetAdvocateSignupAction(),
        ),
      [dispatch],
    );

  return {
    advocateData,
    setAdvocateData,
    patchAdvocateData,
    resetAdvocateSignup,
  };
};

export default useAdvocateSignup;
