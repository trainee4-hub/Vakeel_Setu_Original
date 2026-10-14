import {
  apiRequest,
} from "@shared/services/apiClient";

/* ================================================================
   CREATE CONSULTANCY REQUEST
================================================================ */

export const createConsultancyRequest = async (
  payload,
) => {
  return apiRequest(
    "/user/consultancy",
    {
      method: "POST",
      body: payload,
    },
  );
};

/* ================================================================
   GET CONSULTANCY HISTORY
================================================================ */

export const getConsultancyHistory = async ({
  page = 1,
  limit = 10,
} = {}) => {
  const params =
    new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

  return apiRequest(
    `/user/consultancy?${params.toString()}`,
    {
      method: "GET",
    },
  );
};

/* ================================================================
   GET SINGLE CONSULTANCY REQUEST
================================================================ */

export const getConsultancyRequest = async (
  id,
) => {
  if (!id) {
    throw new Error(
      "Consultancy request ID is required.",
    );
  }

  return apiRequest(
    `/user/consultancy/${encodeURIComponent(
      id,
    )}`,
    {
      method: "GET",
    },
  );
};