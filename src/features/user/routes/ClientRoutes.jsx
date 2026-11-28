import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@app/routes/ProtectedRoute";

import {
  UserDashboard,
  UserProfile,
  SavedLawyer,
  Bookings,
  MyPayments,
  MessageConsultations,
  ChatRoom,
} from "../index";

export const USER_ROLES = ["user", "client", "citizen"];

/**
 * ClientRoutes
 * Encapsulates all Client / Citizen / User portal routes under a unified
 * protected route hierarchy (mirroring AdvocateRoutes and AdminRoutes).
 */
export default function ClientRoutes() {
  return (
    <ProtectedRoute allowedRoles={USER_ROLES} fallbackPath="/dashboard">
      <Routes>
        {/* /client or /client/ -> defaults to bookings */}
        <Route index element={<Navigate to="bookings" replace />} />

        {/* Client Portal Pages */}
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="saved-lawyers" element={<SavedLawyer />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/:id" element={<Bookings />} />
        <Route path="payments" element={<MyPayments />} />
        <Route path="messages" element={<MessageConsultations />} />
        <Route path="chat/:id" element={<ChatRoom />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="bookings" replace />} />
      </Routes>
    </ProtectedRoute>
  );
}
