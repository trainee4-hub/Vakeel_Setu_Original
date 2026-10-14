// Pages
export { default as Login } from "./pages/Login";
export { default as Signup } from "./pages/Signup";
export { default as ForgotPasswordPage } from "./pages/ForgotPasswordPage";
export { default as AdvocateSignup } from "./pages/AdvocateSignup";
export { default as AdvocateExperience } from "./pages/AdvocateExperience";
export { default as AdvocateLoginPage } from "./pages/AdvocateLoginPage";
export { default as UserLoginPage } from "./pages/UserLoginPage";
export { default as AccountExistsPage } from "./pages/AccountExistsPage";

// Components
export { default as OtpInput } from "./components/signup/OtpInput";
export { default as MessageBanner } from "./components/signup/MessageBanner";
export { default as AuthInitializer } from "./components/AuthInitializer";

// Hooks
export { useAuth } from "./hooks/useAuth";
export { useAdvocateSignup } from "./hooks/useAdvocateSignup";

// Services
export * from "./services/authApi";
export * from "./services/advocateRegistrationApi";
export * from "./services/advocatePasswordApi";
export * from "./services/registrationAuthApi";
export * from "./services/registrationOAuthApi";
