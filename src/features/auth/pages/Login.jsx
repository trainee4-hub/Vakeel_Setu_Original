import React, {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import {
  useAdvocateSessionBootstrap,
  advocateLogin,
  advocateLoginSendOtp,
  advocateLoginVerifyOtp,
} from "../../advocate";
import {
  setGoogleLoginPending,
} from "@/utils/authSession";

import {
  AuthApiError,
  getCurrentUser,
  loginSendEmailOtp,
  loginSendOtp,
  loginVerifyEmailOtp,
  loginVerifyOtp,
} from "../services/authApi";

import { API_BASE_URL } from "@shared/services/apiClient";
import { setAuthToken } from "@/utils/auth";

import LoginShell from "../components/login/LoginShell";
import LoginHeroPanel from "../components/login/LoginHeroPanel";
import LoginFormPanel from "../components/login/LoginFormPanel";

const Login = ({
  onBack,
  onSignup,
  onLoginSuccess,
  initialRole = "citizen",
}) => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const { login } =
    useAuth();

  const {
    establishSession,
  } =
    useAdvocateSessionBootstrap();

  const intendedFrom =
    location.state?.from ||
    null;

  const accountCreated =
    Boolean(
      location.state
        ?.accountCreated ||
        location.state
          ?.registrationComplete,
    );

  /* ============================================================
     ROLE
  ============================================================ */

  const [role, setRole] =
    useState(() => {
      const stateRole =
        String(
          location.state
            ?.role ||
            location.state
              ?.accountType ||
            "",
        ).toLowerCase();

      if (
        stateRole ===
        "advocate"
      ) {
        return "advocate";
      }

      return initialRole ===
        "advocate"
        ? "advocate"
        : "citizen";
    });

  /* ============================================================
     USER / ADVOCATE INPUT
  ============================================================ */

  const [
    identifier,
    setIdentifier,
  ] = useState(
    () =>
      location.state
        ?.email || "",
  );

  const [
    loginType,
    setLoginType,
  ] = useState("");

  const [
    advocateLoginMethod,
    setAdvocateLoginMethod,
  ] = useState("phone");

  const [
    password,
    setPassword,
  ] = useState("");

  /* ============================================================
     OTP
  ============================================================ */

  const [otp, setOtp] =
    useState("");

  const [
    otpSent,
    setOtpSent,
  ] = useState(false);

  const [
    countdown,
    setCountdown,
  ] = useState(0);

  /* ============================================================
     LOADING / STATUS
  ============================================================ */

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(false);

  const [
    authStatus,
    setAuthStatus,
  ] = useState(() =>
    accountCreated
      ? {
          type: "success",
          message:
            "Advocate account created successfully. Please sign in to continue.",
        }
      : {
          type: "",
          message: "",
        },
  );

  /* ============================================================
     COUNTDOWN
  ============================================================ */

  useEffect(() => {
    if (countdown <= 0) {
      return undefined;
    }

    const timer =
      window.setInterval(
        () => {
          setCountdown(
            (previous) =>
              previous <= 1
                ? 0
                : previous -
                  1,
          );
        },
        1000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, [countdown]);

  /* ============================================================
     GOOGLE ERROR CALLBACK

     Actual app login route is /login.
  ============================================================ */

  useEffect(() => {
    const params =
      new URLSearchParams(
        location.search,
      );

    const oauthError =
      params.get("error");

    if (!oauthError) {
      return;
    }

    const errorMessages = {
      google_auth_failed:
        "Google authentication failed. Please try again.",

      google_email_missing:
        "We couldn't access an email address from your Google account.",

      account_not_found:
        "No account exists with this Google email. Please create an account first.",

      account_inactive:
        "Your account is currently inactive. Please contact support.",

      server_error:
        "Something went wrong while signing in with Google. Please try again.",
    };

    setGoogleLoading(false);

    setAuthStatus({
      type: "error",

      message:
        errorMessages[
          oauthError
        ] ||
        "Google login could not be completed. Please try again.",
    });

    params.delete("error");

    const cleanSearch =
      params.toString();

    navigate(
      {
        pathname: "/login",

        search:
          cleanSearch
            ? `?${cleanSearch}`
            : "",
      },
      {
        replace: true,
        state:
          location.state,
      },
    );
  }, [
    location.search,
    location.state,
    navigate,
  ]);

  /* ============================================================
     HELPERS
  ============================================================ */

  const formatCountdown = (
    seconds,
  ) => {
    const minutes =
      Math.floor(
        seconds / 60,
      );

    const remaining =
      seconds % 60;

    return `${minutes}:${String(
      remaining,
    ).padStart(2, "0")}`;
  };

  const clearStatus = () => {
    if (
      authStatus.message
    ) {
      setAuthStatus({
        type: "",
        message: "",
      });
    }
  };

  const showError = (
    error,
    fallback,
  ) => {
    setAuthStatus({
      type: "error",

      message:
        error instanceof
        AuthApiError
          ? error.message
          : error?.message ||
            fallback,
    });
  };

  const resetLoginState =
    () => {
      setIdentifier("");
      setLoginType("");
      setOtp("");
      setOtpSent(false);
      setPassword("");
      setCountdown(0);
      setGoogleLoading(
        false,
      );

      setAuthStatus({
        type: "",
        message: "",
      });
    };

  const detectLoginType = (
    value,
  ) => {
    const clean =
      value.trim();

    if (!clean) {
      return "";
    }

    if (
      clean.includes("@")
    ) {
      return "email";
    }

    const phone =
      clean.replace(
        /\s/g,
        "",
      );

    if (
      /^\+?\d+$/.test(
        phone,
      )
    ) {
      return "phone";
    }

    return "";
  };

  const isValidPhone = (
    value,
  ) =>
    /^[6-9]\d{9}$/.test(
      value
        .replace(
          /\s/g,
          "",
        )
        .replace(
          /^(\+91)/,
          "",
        ),
    );

  const isValidEmail = (
    value,
  ) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.trim(),
    );

  const normalizePhone = (
    value,
  ) =>
    value
      .replace(
        /\s/g,
        "",
      )
      .replace(
        /^(\+91)/,
        "",
      );

  /* ============================================================
     INPUT
  ============================================================ */

  const handleIdentifierChange =
    (event) => {
      const value =
        event.target.value;

      setIdentifier(value);

      setLoginType(
        detectLoginType(
          value,
        ),
      );

      if (otpSent) {
        setOtpSent(false);
        setOtp("");
        setCountdown(0);
      }

      clearStatus();
    };

  const handleRoleChange = (
    nextRole,
  ) => {
    setRole(nextRole);

    resetLoginState();

    if (
      nextRole ===
      "advocate"
    ) {
      setAdvocateLoginMethod(
        "phone",
      );
    }
  };

  const handleAdvocateMethodChange =
    (method) => {
      setAdvocateLoginMethod(
        method,
      );

      setOtp("");
      setOtpSent(false);
      setCountdown(0);
      setPassword("");
      setIdentifier("");
      setLoginType("");

      setAuthStatus({
        type: "",
        message: "",
      });
    };

  /* ============================================================
     ADVOCATE SEND OTP
  ============================================================ */

  const handleAdvocateSendOtp =
    async () => {
      setAuthStatus({
        type: "",
        message: "",
      });

      const value =
        identifier.trim();

      if (
        !isValidPhone(
          value,
        )
      ) {
        setAuthStatus({
          type: "error",

          message:
            "Please enter a valid 10-digit Indian mobile number.",
        });

        return;
      }

      setIsLoading(true);

      try {
        await advocateLoginSendOtp(
          {
            phone:
              normalizePhone(
                value,
              ),
          },
        );

        setOtpSent(true);
        setOtp("");
        setCountdown(30);

        setAuthStatus({
          type: "success",
          message:
            "OTP sent to your mobile number.",
        });
      } catch (error) {
        showError(
          error,
          "Unable to send OTP. Please try again.",
        );
      } finally {
        setIsLoading(
          false,
        );
      }
    };

  /* ============================================================
     USER SEND OTP
  ============================================================ */

  const handleUserSendOtp =
    async () => {
      setAuthStatus({
        type: "",
        message: "",
      });

      const value =
        identifier.trim();

      if (!value) {
        setAuthStatus({
          type: "error",
          message:
            "Please enter your phone number or email.",
        });

        return;
      }

      const detected =
        detectLoginType(
          value,
        );

      if (
        detected ===
        "phone"
      ) {
        if (
          !isValidPhone(
            value,
          )
        ) {
          setAuthStatus({
            type: "error",
            message:
              "Please enter a valid 10-digit Indian mobile number.",
          });

          return;
        }

        setIsLoading(true);

        try {
          const response =
            await loginSendOtp(
              {
                phone:
                  normalizePhone(
                    value,
                  ),
              },
            );

          if (
            !response?.success
          ) {
            throw new AuthApiError(
              response?.message ||
                "Unable to send OTP.",
            );
          }

          setLoginType(
            "phone",
          );

          setOtpSent(true);
          setOtp("");
          setCountdown(30);

          setAuthStatus({
            type: "success",
            message:
              "OTP sent to your mobile number.",
          });
        } catch (error) {
          showError(
            error,
            "Unable to send OTP. Please try again.",
          );
        } finally {
          setIsLoading(
            false,
          );
        }

        return;
      }

      if (
        detected ===
        "email"
      ) {
        if (
          !isValidEmail(
            value,
          )
        ) {
          setAuthStatus({
            type: "error",
            message:
              "Please enter a valid email address.",
          });

          return;
        }

        setIsLoading(true);

        try {
          const response =
            await loginSendEmailOtp(
              {
                email:
                  value.toLowerCase(),
              },
            );

          if (
            !response?.success
          ) {
            throw new AuthApiError(
              response?.message ||
                "Unable to send OTP.",
            );
          }

          setLoginType(
            "email",
          );

          setOtpSent(true);
          setOtp("");
          setCountdown(30);

          setAuthStatus({
            type: "success",
            message:
              "OTP sent to your email address.",
          });
        } catch (error) {
          showError(
            error,
            "Unable to send OTP. Please try again.",
          );
        } finally {
          setIsLoading(
            false,
          );
        }

        return;
      }

      setAuthStatus({
        type: "error",
        message:
          "Please enter a valid phone number or email.",
      });
    };

  const handleSendOtp =
    async () => {
      if (
        role ===
        "advocate"
      ) {
        await handleAdvocateSendOtp();

        return;
      }

      await handleUserSendOtp();
    };

  /* ============================================================
     ADVOCATE SESSION
  ============================================================ */

  const finishAdvocateLogin =
    async (token) => {
      if (token) {
        setAuthToken(token);
      }

      const {
        advocate,
        redirectTo,
      } =
        await establishSession(
          {
            token:
              token || null,

            from:
              intendedFrom,
          },
        );

      setAuthStatus({
        type: "success",
        message:
          "Login successful! Redirecting...",
      });

      onLoginSuccess?.(
        advocate,
        token || null,
      );

      navigate(
        redirectTo,
        {
          replace: true,
        },
      );
    };

  /* ============================================================
     ADVOCATE VERIFY PHONE
  ============================================================ */

  const verifyAdvocatePhoneOtp =
    async () => {
      const value =
        identifier.trim();

      const enteredOtp =
        otp.trim();

      if (
        !isValidPhone(
          value,
        )
      ) {
        setAuthStatus({
          type: "error",
          message:
            "Please enter a valid mobile number.",
        });

        return;
      }

      if (!otpSent) {
        setAuthStatus({
          type: "error",
          message:
            "Please request an OTP first.",
        });

        return;
      }

      if (
        !/^\d{6}$/.test(
          enteredOtp,
        )
      ) {
        setAuthStatus({
          type: "error",
          message:
            "Please enter the 6-digit OTP.",
        });

        return;
      }

      setIsLoading(true);

      try {
        const data =
          await advocateLoginVerifyOtp(
            {
              phone:
                normalizePhone(
                  value,
                ),

              otp:
                enteredOtp,
            },
          );

        await finishAdvocateLogin(
          data?.token ||
            null,
        );
      } catch (error) {
        showError(
          error,
          "Unable to verify OTP. Please try again.",
        );
      } finally {
        setIsLoading(
          false,
        );
      }
    };

  /* ============================================================
     ADVOCATE EMAIL PASSWORD
  ============================================================ */

  const loginAdvocateWithEmail =
    async () => {
      const email =
        identifier
          .trim()
          .toLowerCase();

      if (
        !isValidEmail(
          email,
        )
      ) {
        setAuthStatus({
          type: "error",
          message:
            "Please enter a valid email address.",
        });

        return;
      }

      if (!password) {
        setAuthStatus({
          type: "error",
          message:
            "Please enter your password.",
        });

        return;
      }

      setIsLoading(true);

      try {
        const { token } =
          await advocateLogin(
            {
              email,
              password,
            },
          );

        await finishAdvocateLogin(
          token,
        );
      } catch (error) {
        showError(
          error,
          "Unable to login. Please check your email and password.",
        );
      } finally {
        setIsLoading(
          false,
        );
      }
    };

  /* ============================================================
     USER LOGIN
  ============================================================ */

  const resolveUserFromResponse =
    async (data) => {
      const direct =
        data?.user ||
        data?.data?.user ||
        data?.data?.data
          ?.user ||
        null;

      if (direct) {
        return direct;
      }

      const meResponse =
        await getCurrentUser();

      return (
        meResponse?.user ||
        meResponse?.data
          ?.user ||
        meResponse?.data
          ?.data?.user ||
        null
      );
    };

  const verifyUserLogin =
    async () => {
      const value =
        identifier.trim();

      const enteredOtp =
        otp.trim();

      if (!otpSent) {
        setAuthStatus({
          type: "error",
          message:
            "Please request an OTP first.",
        });

        return;
      }

      if (
        !/^\d{6}$/.test(
          enteredOtp,
        )
      ) {
        setAuthStatus({
          type: "error",
          message:
            "Please enter the 6-digit OTP.",
        });

        return;
      }

      setIsLoading(true);

      try {
        let response;

        if (
          loginType ===
          "phone"
        ) {
          response =
            await loginVerifyOtp(
              {
                phone:
                  normalizePhone(
                    value,
                  ),

                otp:
                  enteredOtp,
              },
            );
        } else if (
          loginType ===
          "email"
        ) {
          response =
            await loginVerifyEmailOtp(
              {
                email:
                  value.toLowerCase(),

                otp:
                  enteredOtp,
              },
            );
        } else {
          throw new AuthApiError(
            "Please enter a valid phone number or email.",
          );
        }

        if (
          !response?.success
        ) {
          throw new AuthApiError(
            response?.message ||
              "Login failed.",
          );
        }

        const token =
          response?.token ||
          response?.data
            ?.token ||
          null;

        const authenticatedUser =
          await resolveUserFromResponse(
            response,
          );

        if (
          !authenticatedUser
        ) {
          throw new AuthApiError(
            "We couldn't load your account. Please try signing in again.",
          );
        }

        login(
          authenticatedUser,
          token,
        );

        setAuthStatus({
          type: "success",
          message:
            "Login successful! Redirecting...",
        });

        onLoginSuccess?.(
          authenticatedUser,
          token,
        );

        navigate(
          intendedFrom ||
            "/",
          {
            replace: true,
          },
        );
      } catch (error) {
        showError(
          error,
          "Unable to verify OTP. Please try again.",
        );
      } finally {
        setIsLoading(
          false,
        );
      }
    };

  /* ============================================================
     GOOGLE
  ============================================================ */

  const handleGoogleLogin = () => {
  if (
    googleLoading ||
    isLoading
  ) {
    return;
  }

  setAuthStatus({
    type: "",
    message: "",
  });

  setGoogleLoading(true);

  try {
    const googleLoginUrl =
      role === "advocate"
        ? `${API_BASE_URL}/auth/advocate/google/login`
        : `${API_BASE_URL}/auth/user/google/login`;

    setGoogleLoginPending();

    window.location.assign(
      googleLoginUrl,
    );
  } catch (error) {
    console.error(
      "Google login error:",
      error,
    );

    setGoogleLoading(false);

    setAuthStatus({
      type: "error",
      message:
        "Unable to start Google login.",
    });
  }
};

  /* ============================================================
     PASSWORD RESET COMPLETED
  ============================================================ */

  const handlePasswordResetSuccess =
    ({
      method,
      value,
    }) => {
      setRole("advocate");

      setAdvocateLoginMethod(
        "email",
      );

      /*
       * Existing advocate password login uses email.
       * If reset was performed using email, prefill it.
       */
      setIdentifier(
        method === "email"
          ? value
          : "",
      );

      setLoginType(
        method === "email"
          ? "email"
          : "",
      );

      setPassword("");
      setOtp("");
      setOtpSent(false);
      setCountdown(0);

      setAuthStatus({
        type: "success",

        message:
          "Password reset successfully. Please sign in with your new password.",
      });
    };

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (isLoading) {
        return;
      }

      if (
        role ===
        "advocate"
      ) {
        if (
          advocateLoginMethod ===
          "phone"
        ) {
          await verifyAdvocatePhoneOtp();
        } else {
          await loginAdvocateWithEmail();
        }

        return;
      }

      await verifyUserLogin();
    };

  const handleResendOtp =
    async () => {
      if (
        countdown > 0 ||
        isLoading
      ) {
        return;
      }

      await handleSendOtp();
    };

  const handleEditIdentifier =
    () => {
      setOtpSent(false);
      setOtp("");
      setCountdown(0);

      setAuthStatus({
        type: "",
        message: "",
      });
    };

  const handleCreateAccount =
    () => {
      if (onSignup) {
        onSignup(
          role ===
            "advocate"
            ? "advocate"
            : "user",
        );

        return;
      }

      navigate(
        "/signup",
      );
    };

  const handleBackHome =
    () => {
      if (onBack) {
        onBack();
        return;
      }

      navigate("/");
    };

  const isAdvocatePhone =
    role === "advocate" &&
    advocateLoginMethod ===
      "phone";

  const isAdvocateEmail =
    role === "advocate" &&
    advocateLoginMethod ===
      "email";

  return (
  <LoginShell>
    <LoginHeroPanel />

    <LoginFormPanel
      role={role}
      identifier={identifier}
      loginType={loginType}
      advocateLoginMethod={advocateLoginMethod}
      password={password}
      otp={otp}
      otpSent={otpSent}
      countdown={countdown}
      isLoading={isLoading}
      googleLoading={googleLoading}
      authStatus={authStatus}
      isAdvocatePhone={isAdvocatePhone}
      isAdvocateEmail={isAdvocateEmail}
      onRoleChange={handleRoleChange}
      onAdvocateMethodChange={handleAdvocateMethodChange}
      onIdentifierChange={handleIdentifierChange}
      onPasswordChange={setPassword}
      onClearStatus={clearStatus}
      onSendOtp={handleSendOtp}
      onOtpChange={setOtp}
      onEditIdentifier={handleEditIdentifier}
      onResendOtp={handleResendOtp}
      onSubmit={handleSubmit}
      onGoogleLogin={handleGoogleLogin}
      onCreateAccount={handleCreateAccount}
      onBackHome={handleBackHome}
      onPasswordResetSuccess={handlePasswordResetSuccess}
      formatCountdown={formatCountdown}
    />
  </LoginShell>
);
};

export default Login;