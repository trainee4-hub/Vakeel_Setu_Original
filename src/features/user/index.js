// Pages
export { default as UserDashboard } from "./pages/UserDashboard";
export { default as UserProfile } from "./pages/UserProfile";
export { default as SavedLawyer } from "./pages/SavedLawyer";
export { default as Bookings } from "./pages/Bookings";
export { default as MyPayments } from "./pages/MyPayments";
export { default as MessageConsultations } from "./pages/MessageConsultations";
export { default as LegalAssistantPage } from "./pages/LegalAssistantPage";
export { default as ChatRoom } from "./pages/ChatRoom";

// Components
export { default as LegalAssistant } from "./components/LegalAssistant";
export { default as FloatingConsultant } from "./components/FloatingConsultant";
export { default as RescheduleModal } from "./components/RescheduleModal";
export { default as DetailItem } from "./components/DetailItem";

// Services & Utils
export * from "./services/consultancyApi";
export * from "./services/razorpayLoader";
export * from "./config/paymentsConfig";
export * from "./utils/paymentUtils";
export * from "./utils/dashboardUtils";
export * from "./hooks/usePaymentStateMachine";
export * from "./components/payments/PaymentScreens";
