import React from "react";
import { Routes, Route } from "react-router-dom";
import {
  LegalHub,
  LegalHubDetail,
  Articles,
  BlogDetails,
  Rights,
  RightDetails,
  Guides,
  Updates,
  IPC,
  BNS,
  LawLibrary,
  ActsLibrary,
  ActDetails,
  SectionDetails,
} from "../index";

export default function LegalHubRoutes() {
  return (
    <Routes>
      <Route index element={<LegalHub />} />
      <Route path="articles" element={<Articles />} />
      <Route path="articles/:slug" element={<BlogDetails />} />
      <Route path="rights" element={<Rights />} />
      <Route path="rights/:id" element={<RightDetails />} />
      <Route path="guides" element={<Guides />} />
      <Route path="updates" element={<Updates />} />
      <Route path="ipc" element={<IPC />} />
      <Route path="bns" element={<BNS />} />
      <Route path="law-library" element={<LawLibrary />} />
      <Route path="law-library/acts" element={<ActsLibrary />} />
      <Route path="law-library/acts/:actId" element={<ActDetails />} />
      <Route path="law-library/acts/:actId/sections/:sectionId" element={<SectionDetails />} />
      <Route path=":type/:id" element={<LegalHubDetail />} />
    </Routes>
  );
}
