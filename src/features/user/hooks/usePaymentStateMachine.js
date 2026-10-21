import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { loadRazorpayScript } from "../services/razorpayLoader";
import { extractCapturedPaymentId } from "../utils/paymentUtils";

/**
 * Payment state machine states:
 * idle → starting → popup_open → confirming → success | failed | processing
 */
export const PAYMENT_STATES = {
  IDLE: "idle",
  STARTING: "starting",
  POPUP_OPEN: "popup_open",
  CONFIRMING: "confirming",
  SUCCESS: "success",
  FAILED: "failed",
  PROCESSING: "processing",
};

const POLL_INTERVAL_MS = 5000; // 5 seconds
const FULL_POLL_MAX_TRIES = 24; // ~2 minutes
const QUICK_POLL_MAX_TRIES = 3; // ~15 seconds

/**
 * Explicit, callback-driven payment state machine hook.
 *
 * Rules:
 * - Pay button clickable ONLY in "idle".
 * - First click moves to "starting" immediately (synchronously) before any await.
 * - Second click in any non-idle state is a strict no-op.
 * - Re-enables ONLY on a terminal outcome: error before popup opened or completed status check.
 * - Never re-enables while a status poll is in flight.
 * - Polling automatically stops and clears on component unmount via AbortController + mounted ref.
 * - Verify response failure is ignored because polling is the true authority.
 *
 * @param {Object} callbacks
 * @param {Function} callbacks.onInitiateCheckout - Returns { checkoutId, razorpayOrderId, keyId, amount, currency, prefill }
 * @param {Function} callbacks.onVerifyPayment - POST /verify call
 * @param {Function} callbacks.onCheckStatus - GET /status call
 * @param {Function} [callbacks.onFallbackToFree] - Invoked if checkout 404s (self-correcting fallback)
 */
export function usePaymentStateMachine({
  onInitiateCheckout,
  onVerifyPayment,
  onCheckStatus,
  onFallbackToFree,
} = {}) {
  const [state, setState] = useState(PAYMENT_STATES.IDLE);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);

  // Refs for safe lifecycle and unmount cleanup
  const isMountedRef = useRef(true);
  const pollTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const activeCheckoutIdRef = useRef(null);
  const isPollingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      isPollingRef.current = false;
    };
  }, []);

  /**
   * Status polling loop.
   * Runs until PAID, FAILED, EXPIRED, or max tries reached.
   */
  const executeStatusPoll = useCallback(
    async (checkoutId, isQuickMode = false, packageInfo = null) => {
      if (!checkoutId) return;

      const maxTries = isQuickMode ? QUICK_POLL_MAX_TRIES : FULL_POLL_MAX_TRIES;
      isPollingRef.current = true;
      activeCheckoutIdRef.current = checkoutId;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      let tries = 0;

      const pollStep = async () => {
        if (!isMountedRef.current) return;

        tries += 1;

        try {
          const statusResult = await onCheckStatus(checkoutId);
          if (!isMountedRef.current) return;

          const status = (statusResult?.status || "").toUpperCase();

          // 1. Terminal Success: PAID
          if (status === "PAID") {
            isPollingRef.current = false;
            const capturedPaymentId = extractCapturedPaymentId(statusResult);
            setPaymentResult({
              checkoutId,
              orderId: statusResult?.razorpayOrderId || statusResult?.payment?.razorpayOrderId,
              paymentId: capturedPaymentId,
              amount: statusResult?.amount || statusResult?.payment?.amount,
              amountRupees: statusResult?.amountRupees || statusResult?.payment?.amountRupees,
              paidAt: statusResult?.paidAt || statusResult?.payment?.paidAt || new Date().toISOString(),
              consultancyRequestId: statusResult?.consultancyRequestId || statusResult?.payment?.consultancyRequestId,
              consultancyRequest: statusResult?.consultancyRequest,
              package: packageInfo,
            });
            setState(PAYMENT_STATES.SUCCESS);
            return;
          }

          // 2. Terminal Failure: FAILED or EXPIRED
          if (status === "FAILED") {
            isPollingRef.current = false;
            setErrorMessage(
              statusResult?.message ||
                "Payment failed. No money was deducted; if it was, it will be auto-refunded by your bank."
            );
            setState(PAYMENT_STATES.FAILED);
            return;
          }

          if (status === "EXPIRED") {
            isPollingRef.current = false;
            setErrorMessage("Payment session expired. Please try again.");
            setState(PAYMENT_STATES.FAILED);
            return;
          }

          // 3. PROCESSING
          if (status === "PROCESSING") {
            if (tries >= maxTries) {
              isPollingRef.current = false;
              setState(PAYMENT_STATES.PROCESSING);
              return;
            }
          }

          // 4. If quick mode finishes and still CREATED (user cancelled popup)
          if (isQuickMode && tries >= maxTries) {
            isPollingRef.current = false;
            setErrorMessage("Payment not completed.");
            setState(PAYMENT_STATES.FAILED);
            return;
          }

          // 5. Max tries reached in full mode without terminal state
          if (tries >= maxTries) {
            isPollingRef.current = false;
            // Default to processing if we hit ~2 minutes of confirmation
            setState(PAYMENT_STATES.PROCESSING);
            return;
          }

          // Schedule next poll step
          if (isMountedRef.current) {
            pollTimerRef.current = setTimeout(pollStep, POLL_INTERVAL_MS);
          }
        } catch {
          if (!isMountedRef.current) return;

          if (tries >= maxTries) {
            isPollingRef.current = false;
            setState(PAYMENT_STATES.PROCESSING);
            return;
          }

          if (isMountedRef.current) {
            pollTimerRef.current = setTimeout(pollStep, POLL_INTERVAL_MS);
          }
        }
      };

      // Start first poll step after one interval
      pollTimerRef.current = setTimeout(pollStep, POLL_INTERVAL_MS);
    },
    [onCheckStatus]
  );

  /**
   * Starts the payment flow.
   * Can ONLY be initiated from IDLE state.
   */
  const startPayment = useCallback(
    async (packageData, contactData) => {
      // RULE: Pay is clickable ONLY in idle. Second click is a strict no-op.
      if (state !== PAYMENT_STATES.IDLE) {
        return false;
      }

      // Immediately move to starting synchronously before any await
      setState(PAYMENT_STATES.STARTING);
      setErrorMessage("");

      try {
        // Step 1: Initiate checkout via callback
        let checkoutResult;
        try {
          checkoutResult = await onInitiateCheckout({
            callType: packageData.callType,
            duration: packageData.duration,
            phoneNumber: contactData.phoneNumber,
            email: contactData.email,
          });
        } catch (initErr) {
          // Check for 404 self-correcting fallback
          if (initErr?.status === 404 && onFallbackToFree) {
            console.warn(
              "[Payments] POST /user/consultancy/checkout returned 404. Falling back to free booking flow."
            );
            const fallbackResult = await onFallbackToFree({
              callType: packageData.callType,
              duration: packageData.duration,
              phoneNumber: contactData.phoneNumber,
              email: contactData.email,
            });
            if (isMountedRef.current) {
              setPaymentResult({
                isFreeFallback: true,
                consultancyRequest: fallbackResult,
                package: packageData,
              });
              setState(PAYMENT_STATES.SUCCESS);
            }
            return true;
          }

          // Check for documented codes
          if (initErr?.code === "PAYMENT_PROCESSING") {
            if (isMountedRef.current) {
              setState(PAYMENT_STATES.PROCESSING);
            }
            return false;
          }

          if (initErr?.code === "ALREADY_PAID") {
            if (isMountedRef.current) {
              setState(PAYMENT_STATES.SUCCESS);
            }
            return false;
          }

          throw initErr;
        }

        const checkout = checkoutResult?.checkout || checkoutResult;
        const checkoutId = checkout?.checkoutId;
        const razorpayOrderId = checkout?.razorpayOrderId;
        const keyId = checkout?.keyId;

        // Check if existing order has expired
        if (checkout?.expiresAt) {
          const expTime = new Date(checkout.expiresAt).getTime();
          if (Number.isFinite(expTime) && expTime <= Date.now()) {
            setErrorMessage(
              "This payment session has expired. Please try again to start a fresh checkout."
            );
            setState(PAYMENT_STATES.IDLE);
            return false;
          }
        }

        // CRITICAL SECURITY CHECK: keyId must NEVER be live in test mode
        if (keyId && String(keyId).startsWith("rzp_live_")) {
          const liveKeyError = new Error(
            "CRITICAL SECURITY ALERT: Received live Razorpay key (rzp_live_*) in test mode. Aborting payment."
          );
          console.error(liveKeyError);
          setErrorMessage(
            "Payment configuration error. Please contact administrator."
          );
          setState(PAYMENT_STATES.IDLE);
          return false;
        }

        activeCheckoutIdRef.current = checkoutId;

        // Step 2: Load Razorpay script on demand
        let RazorpayClass;
        try {
          RazorpayClass = await loadRazorpayScript();
        } catch (scriptErr) {
          if (isMountedRef.current) {
            setErrorMessage(scriptErr.message || "Failed to load payment window.");
            // Error before popup opens: re-enable to idle
            setState(PAYMENT_STATES.IDLE);
          }
          return false;
        }

        if (!isMountedRef.current) return false;

        // Step 3: Open Razorpay modal
        const razorpayOptions = {
          key: keyId,
          order_id: razorpayOrderId,
          name: "VakeelSetu",
          description: `${packageData.title || "Legal Consultation"} (${packageData.duration} mins)`,
          prefill: {
            contact: contactData.phoneNumber || "",
            email: contactData.email || "",
          },
          theme: {
            color: "#0f172a", // slate-900
          },
          handler: async (response) => {
            // Callback is NOT proof of payment.
            // Go to Confirming -> POST /verify (ignore failure) -> Poll /status
            if (!isMountedRef.current) return;
            setState(PAYMENT_STATES.CONFIRMING);

            if (onVerifyPayment) {
              try {
                await onVerifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
              } catch (verifyErr) {
                // Ignore verify failure; polling is the real source of truth
                console.warn("[Payments] POST /verify failed (ignored):", verifyErr);
              }
            }

            executeStatusPoll(checkoutId, false, packageData);
          },
          modal: {
            ondismiss: () => {
              // User dismissed popup: closing popup does NOT mean payment failed.
              // Run quick mode poll (3 tries)
              if (!isMountedRef.current) return;
              setState(PAYMENT_STATES.CONFIRMING);
              executeStatusPoll(checkoutId, true, packageData);
            },
          },
        };

        const rzp = new RazorpayClass(razorpayOptions);

        rzp.on("payment.failed", (failedRes) => {
          console.warn("[Payments] Razorpay payment.failed event:", failedRes);
          if (!isMountedRef.current) return;
          setState(PAYMENT_STATES.CONFIRMING);
          executeStatusPoll(checkoutId, true, packageData);
        });

        // Move to popup_open
        setState(PAYMENT_STATES.POPUP_OPEN);

        // Open modal synchronously
        rzp.open();
        // IMPORTANT: No finally block resetting paying/state here!
        return true;
      } catch (err) {
        if (!isMountedRef.current) return false;
        const msg =
          err?.userMessage ||
          err?.message ||
          "Unable to initiate payment. Please try again.";
        setErrorMessage(msg);
        // Error thrown before popup opened: re-enable Pay by returning to IDLE
        setState(PAYMENT_STATES.IDLE);
        return false;
      }
    },
    [
      state,
      onInitiateCheckout,
      onFallbackToFree,
      onVerifyPayment,
      executeStatusPoll,
    ]
  );

  /**
   * Resets the state machine back to IDLE.
   * Only allowed from terminal states.
   */
  const resetToIdle = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isPollingRef.current = false;
    setErrorMessage("");
    setState(PAYMENT_STATES.IDLE);
  }, []);

  /**
   * Manual check status trigger (e.g. "Check status" button on Processing screen).
   */
  const checkCurrentStatus = useCallback(async () => {
    const checkoutId = activeCheckoutIdRef.current;
    if (!checkoutId || !onCheckStatus) return;

    try {
      const res = await onCheckStatus(checkoutId);
      if (!isMountedRef.current) return;

      const status = (res?.status || "").toUpperCase();
      if (status === "PAID") {
        const capturedPaymentId = extractCapturedPaymentId(res);
        setPaymentResult((prev) => ({
          ...prev,
          checkoutId,
          orderId: res?.razorpayOrderId || res?.payment?.razorpayOrderId || prev?.orderId,
          paymentId: capturedPaymentId || prev?.paymentId,
          amount: res?.amount || res?.payment?.amount || prev?.amount,
          amountRupees: res?.amountRupees || res?.payment?.amountRupees || prev?.amountRupees,
          paidAt: res?.paidAt || res?.payment?.paidAt || prev?.paidAt || new Date().toISOString(),
          consultancyRequestId: res?.consultancyRequestId || res?.payment?.consultancyRequestId || prev?.consultancyRequestId,
        }));
        setState(PAYMENT_STATES.SUCCESS);
      } else if (status === "FAILED") {
        setErrorMessage("Payment failed. Please try again.");
        setState(PAYMENT_STATES.FAILED);
      }
    } catch (err) {
      console.warn("[Payments] Manual status check failed:", err);
    }
  }, [onCheckStatus]);

  return {
    state,
    errorMessage,
    paymentResult,
    isPayDisabled: state !== PAYMENT_STATES.IDLE,
    startPayment,
    resetToIdle,
    checkCurrentStatus,
  };
}
