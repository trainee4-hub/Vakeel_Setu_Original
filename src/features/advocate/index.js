// Pages
export { default as FindLawyerPage } from "./pages/FindLawyerPage";
export { default as AdvocateProfilePage } from "./pages/AdvocateProfilePage";
export { default as AdvocateDashboard } from "./pages/AdvocateDashboard";
export { default as AdvocateCompleteProfile } from "./pages/AdvocateCompleteProfile";
export { default as AdvocateBookings } from "./pages/AdvocateBookings";
export { default as AdvocateMessages } from "./pages/AdvocateMessages";
export { default as AdvocateTeam } from "./pages/AdvocateTeam";
export { default as AdvocateTeamMemberProfile } from "./pages/AdvocateTeamMemberProfile";
export { default as AdvocatePricing } from "./pages/AdvocatePricing";
export { default as AdvocateMyProfile } from "./pages/AdvocateMyProfile";
export { default as AdvocateEditProfile } from "./pages/AdvocateEditProfile";
export { default as AdvocateAccountSettings } from "./pages/AdvocateAccountSettings";

// Components
export { default as FindLawyer } from "./components/FindLawyer/FindLawyer";
export { default as AdvocateProfile } from "./components/AdvocateProfile/AdvocateProfile";
export { default as AdvocateCard } from "./components/AdvocateCard";
export { default as ClientPublicProfile } from "./components/ClientPublicProfile";
export { default as AdvocateDashboardSkeleton } from "./components/skeleton/AdvocateDashboardSkeleton";
export { default as AdvocateCardSkeleton } from "./components/skeleton/AdvocateCardSkeleton";
export { default as AdvocateProfileSkeleton } from "./components/skeleton/AdvocateProfileSkeleton";

// Services
export * from "./services/advocateApi";
export * from "./services/advocateProfileApi";

// Hooks
export { default as useAdvocateDashboard } from "./hooks/useAdvocateDashboard";
export { default as useAdvocateTeam } from "./hooks/useAdvocateTeam";
export { default as useAdvocateOnlineStatus } from "./hooks/useAdvocateOnlineStatus";
export { default as useAdvocateProfileSync, resetAdvocateProfileSync, markAdvocateProfileSynced } from "./hooks/useAdvocateProfileSync";
export { default as useAdvocateSessionBootstrap } from "./hooks/useAdvocateSessionBootstrap";

// Routes & Layout
export { default as AdvocateRoutes } from "./routes/AdvocateRoutes";
export { default as AdvocateProfileGuard } from "./routes/AdvocateProfileGuard";
export { default as AdvocateLayout } from "./layouts/AdvocateLayout";
