import React from "react";
import { Routes, Route } from "react-router-dom";
import {
  LegalServicesIndexPage,
  CategoryLandingPage,
  ServiceDetailPage,
} from "../index";

export default function LegalServicesRoutes() {
  return (
    <Routes>
      <Route index element={<LegalServicesIndexPage />} />
      <Route path=":categorySlug" element={<CategoryLandingPage />} />
      <Route path=":categorySlug/:serviceSlug" element={<ServiceDetailPage />} />
    </Routes>
  );
}
