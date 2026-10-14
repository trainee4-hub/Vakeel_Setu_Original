import React, { useRef, useEffect } from "react";

/**
 * OtpInput
 * -----------------------------------------------------------------------
 * Six separate boxes that behave like one field. Handles auto-advance,
 * backspace-to-previous, arrow-key navigation, and paste of a full code.
 *
 * value:    string, e.g. "123" (in-progress) or "123456" (complete)
 * onChange: (nextValue: string) => void
 * length:   number of digits, default 6
 * disabled: disables all boxes (e.g. while verifying)
 * error:    boolean — applies error styling
 */
export default function OtpInput({ value, onChange, length = 6, disabled = false, error = false, autoFocus = true }) {
  const inputsRef = useRef([]);
  const digits = value.split("").slice(0, length);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDigit = (index, digit) => {
    const next = value.split("");
    next[index] = digit;
    const joined = next.join("").slice(0, length);
    onChange(joined);
  };

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigit(index, "");
      return;
    }
    // Handle fast typing / autofill dropping more than one char in a box
    if (raw.length > 1) {
      const next = value.split("");
      for (let i = 0; i < raw.length && index + i < length; i++) {
        next[index + i] = raw[i];
      }
      onChange(next.join("").slice(0, length));
      const lastFilled = Math.min(index + raw.length, length - 1);
      inputsRef.current[lastFilled]?.focus();
      return;
    }
    setDigit(index, raw);
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setDigit(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    const lastFilled = Math.min(pasted.length, length - 1);
    inputsRef.current[lastFilled]?.focus();
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`Digit ${i + 1} of verification code`}
          className={[
            "h-12 w-11 sm:h-14 sm:w-12 text-center text-lg font-semibold rounded-xl border bg-white",
            "text-slate-800 transition-all outline-none",
            "focus:ring-2 focus:ring-amber-400 focus:border-amber-400",
            error ? "border-red-300 bg-red-50" : "border-slate-200",
            disabled ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
