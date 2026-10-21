/**
 * On-demand script loader for Razorpay Checkout.
 *
 * Rules:
 * - Loaded strictly ON DEMAND (never at app boot).
 * - Resolves once, cached in memory, and reuses window.Razorpay if present.
 * - Handles load failure with specific user-facing message.
 * - ZERO npm packages used.
 * - NO Razorpay secret anywhere in frontend or .env.
 */

let loadPromise = null;

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
export const RAZORPAY_LOAD_ERROR_MESSAGE =
  "Could not load the payment window. Check your connection and try again.";

export function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not defined"));
  }

  // If Razorpay is already available globally, reuse it immediately
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  // If a load request is already in-flight, return the shared promise
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    // Check if script tag was already added by a previous call
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);

    if (existing) {
      existing.addEventListener("load", () => {
        if (window.Razorpay) {
          resolve(window.Razorpay);
        } else {
          loadPromise = null;
          reject(new Error(RAZORPAY_LOAD_ERROR_MESSAGE));
        }
      });

      existing.addEventListener("error", () => {
        loadPromise = null;
        reject(new Error(RAZORPAY_LOAD_ERROR_MESSAGE));
      });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;

    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        loadPromise = null;
        reject(new Error(RAZORPAY_LOAD_ERROR_MESSAGE));
      }
    };

    script.onerror = () => {
      loadPromise = null;
      script.remove();
      reject(new Error(RAZORPAY_LOAD_ERROR_MESSAGE));
    };

    document.body.appendChild(script);
  });

  return loadPromise;
}
