import {
  API_BASE_URL,
} from "@shared/services/apiClient";

export { API_BASE_URL };

export function getDashboardActivePage(pathname) {
  if (pathname === "/find-lawyer") return "findLawyer";
  if (pathname === "/legal-assistant" || pathname === "/ipc-wiki") return "legalAssistant";
  if (pathname === "/bookings") return "bookings";
  if (pathname === "/messages") return "messages";
  if (pathname === "/user-profile") return "user-profile";

  return "dashboard";
}